"""Publish only allowlisted Compose proof as a GitHub Actions notice."""
import argparse, json, math, pathlib, re
TITLE = 'ATLAS_COMPOSE_PROOF_V1'
LIMITS = ['Hosted fresh checkout, not pristine physical hardware; base images/tools may be cached.', 'HTTP shell only; browser rendering not observed.']

def escape(value):
    return value.replace('%','%25').replace('\r','%0D').replace('\n','%0A')

def summary(report):
    result = {'success': report.get('success') is True, 'limits': LIMITS}
    patterns = {'checkout_sha':r'[a-f0-9]{40}', 'started_at':r'[0-9T:.+Z-]{20,40}', 'finished_at':r'[0-9T:.+Z-]{20,40}', 'docker_version':r'[0-9A-Za-z.+-]{1,50}', 'compose_version':r'v?[0-9A-Za-z.+-]{1,50}'}
    for key,pattern in patterns.items():
        value=report.get(key)
        if isinstance(value,str) and re.fullmatch(pattern,value): result[key]=value
    for key in ['elapsed_seconds','total_seconds','initial_image_count']:
        value=report.get(key)
        if type(value) in (int,float) and math.isfinite(value) and value>=0: result[key]=value
    result['cleanup'] = 'success (own project only)' if report.get('cleanup')=='success (own project only)' else 'not successful or not recorded'
    expected={'status':200,'body':{'status':'ok','service':'backend','scope':'liveness'}}
    result['health']=expected if report.get('health')==expected else {'verified':False}
    front=report.get('frontend',{})
    result['frontend']={key:front[key] for key in ['status','bytes','atlas_marker'] if key in front and (type(front[key]) is int or type(front[key]) is bool)}
    if re.fullmatch(r'[a-f0-9]{64}',str(front.get('sha256',''))): result['frontend']['sha256']=front['sha256']
    return result

def notice(report):
    payload=json.dumps(summary(report),separators=(',',':'),allow_nan=False)
    if len(payload)>8000: raise ValueError('Proof exceeds publication bound')
    return '::notice title='+TITLE+'::'+escape(payload)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('report');args=parser.parse_args()
    print(notice(json.loads(pathlib.Path(args.report).read_text(encoding='utf-8-sig'))))
