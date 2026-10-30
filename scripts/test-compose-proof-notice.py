"""Synthetic emitter validation only; never Docker acceptance measurements."""
import importlib.util, json, pathlib, unittest
spec=importlib.util.spec_from_file_location('notice',pathlib.Path(__file__).with_name('compose-proof-notice.py'))
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class EmitterTest(unittest.TestCase):
 def test_fixed_nested_allowlist(self):
  fixture={'success':True,'checkout_sha':'a'*40,'elapsed_seconds':12.5,'password':'SYNTHETIC_FORBIDDEN_MARKER','commands':[{'secret':'SYNTHETIC_FORBIDDEN_MARKER'}],'health':{'status':200,'body':{'status':'ok','service':'backend','scope':'liveness'}},'frontend':{'status':200,'bytes':123,'atlas_marker':True,'sha256':'b'*64,'body':'SYNTHETIC_FORBIDDEN_MARKER'},'cleanup':'success (own project only)'}
  output=module.notice(fixture);parsed=json.loads(output.split('::',2)[2]);self.assertEqual(parsed['elapsed_seconds'],12.5);self.assertEqual(parsed['health'],fixture['health']);self.assertNotIn('SYNTHETIC_FORBIDDEN_MARKER',output);self.assertEqual(parsed['frontend']['sha256'],'b'*64)
 def test_command_escaping(self):
  self.assertEqual(module.escape('x%\r\n::notice'), 'x%25%0D%0A::notice')
 def test_reject_untrusted_values_and_failure(self):
  output=module.notice({'success':False,'checkout_sha':'secret\n::error','elapsed_seconds':float('nan'),'health':{'body':'SYNTHETIC_FORBIDDEN_MARKER'},'frontend':{'sha256':'SYNTHETIC_FORBIDDEN_MARKER'}})
  parsed=json.loads(output.split('::',2)[2]);self.assertFalse(parsed['success']);self.assertNotIn('checkout_sha',parsed);self.assertNotIn('elapsed_seconds',parsed);self.assertNotIn('SYNTHETIC_FORBIDDEN_MARKER',output)
if __name__=='__main__': unittest.main()
