import os
import sys

COMMENTS = {'.py': ('"""', '    ', '"""'),
            '.js': ('/*', ' * ', '*/'),
            '.txt': ('#'*20, '# ', '#'*20)}

def add_license(rootdir, license):
    """
    add license to all files in directory
    """
    for root, subFolders, files in os.walk(rootdir):
        for file in files:
            filename = os.path.join(root,file)
            if '.js' == file[:-3]:
                print file

def get_license_header(license_filename):
    """
    """
    pass

if __name__ == "__main__":
    if len(sys.argv) >= 1:
        rootdir = sys.argv[1]
    else:
        rootdir = os.curdir
    if len(sys.argv) >= 2:
        license_filename = sys.argv[2]
    else:
        license_filename = "LICENSE.txt"
    
    license = get_license_header(license_filename)
    add_license(rootdir, license)
