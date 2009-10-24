from lib.xml_utils import ConvertXmlToDict
from settings import pathify, path, PROJECT_PATH

import os

def get_version():
    install_rdf_fn = pathify([PROJECT_PATH, 'procrasdonate', 'ProcrasDonateFFExtn', 'install.rdf'], file_extension=True)
    install_rdf_f = open(install_rdf_fn, 'r')
    install_rdf = install_rdf_f.read()

    d = ConvertXmlToDict(install_rdf)

    a = '{http://www.w3.org/1999/02/22-rdf-syntax-ns#}RDF'
    b = '{http://www.w3.org/1999/02/22-rdf-syntax-ns#}Description'
    c = "{http://www.mozilla.org/2004/em-rdf#}version"

    return d[a][b][c]

def xpi_it():
    extn_dir = pathify([PROJECT_PATH, 'procrasdonate', 'ProcrasDonateFFExtn'])
    extn_nm = pathify([PROJECT_PATH, 'media', 'xpi', 'ProcrasDonate_%s.xpi' % get_version()], file_extension=True)
    
    os.chdir(extn_dir)
    return os.popen('zip -r %s *' % extn_nm)

if __name__ == "__main__":
    print xpi_it()
