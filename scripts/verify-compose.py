"""Disposable Docker acceptance capture. Output is a narrow sanitized JSON allowlist."""
import argparse, datetime, hashlib, json, os, pathlib, re, secrets, socket, subprocess, tempfile, time, urllib.request


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    root = pathlib.Path(__file__).resolve().parents[1]
    start = float(os.environ.get('ACCEPTANCE_START_EPOCH', time.time()))
    deadline = start + 600
    project = 'atlas-proof-' + secrets.token_hex(6)
    report = {'started_at': datetime.datetime.fromtimestamp(start, datetime.timezone.utc).isoformat(), 'project': project,
              'environment': 'GitHub-hosted runner' if os.environ.get('GITHUB_ACTIONS') else 'local caller',
              'limits': ['Fresh checkout is not a pristine physical machine; runner tools/base image cache may be preinstalled.',
                         'HTTP shell response only; browser rendering not observed.', 'No host npm install/build; builds run inside Docker.'],
              'commands': [], 'success': False}
    env = os.environ.copy()
    compose = None
    def run(command, label, cleanup=False):
        remaining = max(1, int(deadline-time.time()))
        result = subprocess.run(command, cwd=root, env=env, capture_output=True, text=True, timeout=60 if cleanup else remaining)
        report['commands'].append({'command': label, 'exit': result.returncode})
        if result.returncode: raise RuntimeError(label + ' failed; raw output withheld to avoid secret disclosure')
        return result.stdout.strip()
    try:
        report['checkout_sha'] = run(['git','rev-parse','HEAD'], 'git rev-parse HEAD')
        report['docker_version'] = run(['docker','version','--format','{{.Server.Version}}'], 'docker version (server version only)')
        if int(report['docker_version'].split('.')[0]) < 24: raise RuntimeError('Docker Engine 24+ required')
        version = run(['docker','compose','version','--short'], 'docker compose version --short')
        report['compose_version'] = version
        match = re.match(r'v?(\d+)\.(\d+)\.(\d+)',version)
        if not match or tuple(map(int,match.groups())) < (2,20,3): raise RuntimeError('Compose 2.20.3+ required')
        report['initial_image_count'] = len(run(['docker','image','ls','-q'], 'docker image ls -q (count only)').splitlines())
        values = {}
        for line in (root/'.env.example').read_text().splitlines():
            if line and not line.startswith('#'):
                key,value=line.split('=',1);values[key]=value
        values['POSTGRES_PASSWORD'] = secrets.token_hex(24)
        values['BACKEND_PUBLISH_HOST'] = values['FRONTEND_PUBLISH_HOST'] = '127.0.0.1'
        # Reserve distinct available loopback ports while choosing; release before Compose binds.
        with socket.socket() as one, socket.socket() as two:
            one.bind(('127.0.0.1',0));two.bind(('127.0.0.1',0))
            values['BACKEND_PUBLISH_PORT']=str(one.getsockname()[1]);values['FRONTEND_PUBLISH_PORT']=str(two.getsockname()[1])
        env.update(values)  # Explicit disposable values override inherited service variables.
        with tempfile.TemporaryDirectory(prefix='atlas-compose-env-') as directory:
            private = pathlib.Path(directory)/'.env';private.write_text(''.join(k+'='+v+'\n' for k,v in values.items()));private.chmod(0o600)
            compose = ['docker','compose','--project-name',project,'--env-file',str(private)]
            try:
                run(compose+['config','--quiet'], 'docker compose --env-file PRIVATE --project-name UNIQUE config --quiet')
                run(compose+['up','--build','-d'], 'docker compose --env-file PRIVATE --project-name UNIQUE up --build -d')
                health_url='http://127.0.0.1:'+values['BACKEND_PUBLISH_PORT']+'/health'
                front_url='http://127.0.0.1:'+values['FRONTEND_PUBLISH_PORT']+'/'
                while time.time() < deadline:
                    try:
                        with urllib.request.urlopen(health_url,timeout=3) as response:
                            health=json.load(response);health_status=response.status
                        with urllib.request.urlopen(front_url,timeout=3) as response:
                            body=response.read(2*1024*1024);front_status=response.status;content_type=response.headers.get('Content-Type','')
                        if health_status!=200 or health!={'status':'ok','service':'backend','scope':'liveness'}: raise RuntimeError('Unexpected health response')
                        if front_status!=200 or b'Atlas' not in body or b'<html' not in body.lower(): raise RuntimeError('Unexpected frontend shell')
                        report.update(health={'status':health_status,'body':health},frontend={'status':front_status,'content_type':content_type,'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'atlas_marker':True},elapsed_seconds=round(time.time()-start,3))
                        if time.time()>=deadline: raise RuntimeError('600 second deadline exceeded')
                        report['success']=True;break
                    except (OSError,ValueError): time.sleep(1)
                if not report['success']: raise RuntimeError('600 second readiness deadline exceeded')
            finally:
                try:
                    run(compose+['down','--volumes','--remove-orphans'], 'docker compose --project-name UNIQUE down --volumes --remove-orphans',cleanup=True)
                    report['cleanup']='success (own project only)'
                except Exception:
                    report['cleanup']='failed (own project only)';report['success']=False
    except Exception as error:
        # Never serialize subprocess output/env or exception data from HTTP bodies.
        report['error_type']=type(error).__name__
    finally:
        report['finished_at']=datetime.datetime.now(datetime.timezone.utc).isoformat()
        report['total_seconds']=round(time.time()-start,3)
        output=pathlib.Path(args.output);output.parent.mkdir(parents=True,exist_ok=True);output.write_text(json.dumps(report,indent=2)+'\n')
    return 0 if report['success'] else 1

if __name__=='__main__': raise SystemExit(main())
