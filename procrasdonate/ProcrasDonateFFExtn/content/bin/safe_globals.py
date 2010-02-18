"""
Concatenates all ProcrasDonate javascript files into
a single file wrapped by the ProcrasDonate function.

This way, our code doesn't have to have use the ProcrasDonate
namespace. External code must not only use the ProcrasDonate
namespace, but only one instance of the Overlay is returned.
"""

from settings import pathify, path, PROJECT_PATH, MEDIA_ROOT
import shutil
import os

def concatenate(root, input_file, output_file):
    """
    @param root: root directory of extension
    @param input_file: relative path from root to file containing
        the list of javascript files to concatenate. listed files
        should also contain relative paths from root
    @param output_file: relative path from root to the file
        containing the wrapped concatenations.
    """
    print "ROOT", root
    print "INPUT FILE", input_file
    print "OUTPUT FILE", output_file
    
    js = open(root+os.sep+output_file, 'w')
    js.write(";var ProcrasDonate = (function() {\n");
    
    f = open(root+os.sep+input_file, 'r')
    for line in f.readlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        js.write("\n\n/**************** %s *****************/\n" % line)
        shutil.copyfileobj(open(root+os.sep+line, 'r'), js)
    f.close()
    
    js.write("return myOverlay\n");
    js.write("})();\n");
    js.close()

if __name__=="__main__":
    root = pathify([PROJECT_PATH, 'procrasdonate', 'ProcrasDonateFFExtn'])
    input_file = pathify(['content', 'overlay_list.txt'], file_extension=True)
    output_file = pathify(['content', 'js', 'generated_javascript.js'], file_extension=True)
    
    concatenate(root, input_file, output_file)
    
    """
    # procrasdonate files
    input_file = pathify(['content', 'overlay_procrasdonate.txt'], file_extension=True)
    output_file = pathify(['content', 'js', 'generated_pd_javascript.js'], file_extension=True)
    
    concatenate(root, input_file, output_file)
    
    # externals
    input_file = pathify(['content', 'overlay_externals.txt'], file_extension=True)
    output_file = pathify(['content', 'js', 'generated_externals_javascript.js'], file_extension=True)
    
    concatenate(root, input_file, output_file)
    """
    