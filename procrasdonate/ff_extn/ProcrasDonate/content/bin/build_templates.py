#!/usr/bin/env python

import sys, os

# Make sure required paths are in 'sys.path'
base_path = "/home/dan/tam/"
extra_paths = [
        base_path,
        os.path.join(base_path, "ext/lib"),
        ]
sys.path[0:0] = extra_paths
#os.chdir(base_path)

from django.conf import settings
settings.configure()

def main(args):
    from django.template.loader import get_template_from_string
    from json_template import jsonify_nodelist
    for filename in args[1:]:
        out_filename = filename + ".js"
        try:
            f = open(filename)
            source = f.read()
            f.close()
        except:
            raise RuntimeError("Could not load file: %r" % (filename,))
        
        template = get_template_from_string(source, None, filename)
        
        json_template = jsonify_nodelist(template.nodelist)
        
        f = open(out_filename, "w")
        f.write(json_template)
        f.close()
        
        print "wrote %r" % (out_filename,)
        
    return 0

if __name__ == "__main__":
    import sys
    exit(main(sys.argv))

