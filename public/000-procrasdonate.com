NameVirtualHost *:80
NameVirtualHost *:443

FastCGIServer /var/sites/ProcrasDonate/public/dispatch.fcgi -initial-env PROJECT_PATH=/var/sites/ProcrasDonate/ -idle-timeout 120

<VirtualHost *:80>
	ServerAdmin lucy@ProcrasDonate.com
	ServerName  procrasdonate.com
	ServerAlias procrasdonate.org
	ServerAlias procrastdonate.com
	ServerAlias procrastdonate.org
	ServerAlias www.procrasdonate.com
	ServerAlias www.procrasdonate.org
	ServerAlias www.procrastdonate.com
	ServerAlias www.procrastdonate.org

        DocumentRoot /var/www/
	<Directory />
		Options FollowSymLinks
		AllowOverride None
	</Directory>
	<Directory /var/www/>
		Options Indexes FollowSymLinks MultiViews
		AllowOverride None
		Order allow,deny
		allow from all
	</Directory>


	Alias /robots.txt /var/sites/ProcrasDonate/media/txt/robots.txt
	#Redirect /robots.txt /procrasdonate_media/txt/robots.txt
	
	#RedirectMatch ^/$ /pd/
	##
	## redirect all HTTP to HTTPS
	## http://www.cyberciti.biz/tips/howto-apache-force-https-secure-connections.html
	## 
	
	#Redirect / https://procrasdonate.com/
	
        ErrorLog /var/log/apache2/procrasdonate.com/error.log
        LogLevel warn
        CustomLog /var/log/apache2/procrasdonate.com/access.log combined
        ServerSignature On

        LoadModule alias_module modules/mod_alias.so
        Alias /media /usr/local/django_src/django/contrib/admin/media/
        Alias /procrasdonate_media /var/sites/ProcrasDonate/media
        Alias / /var/sites/ProcrasDonate/public/dispatch.fcgi/

	AddType text/javascript .js
	AddType application/x-xpinstall .xpi

        ExpiresActive On
        ExpiresByType text/javascript "access plus 2 hours"
        ExpiresByType image/gif  "access plus 2 days"
        ExpiresByType image/jpeg "access plus 2 days"
        ExpiresByType text/css  "access plus 2 hours"
        ExpiresByType image/png  "access plus 2 days"
	ExpiresByType application/x-shockwave-flash "access plus 1 week"
	ExpiresByType application/x-xpinstall "access plus 0 minutes"
	ExpiresByType text/xml "access plus 0 minutes"

<LocationMatch "/get/data/*">
  ExpiresActive Off
</LocationMatch>

<LocationMatch "/procrasdonate_media/rdf/*">
  ExpiresActive Off
</LocationMatch>

<LocationMatch "/procrasdonate_media/xpi/*">
  ExpiresActive Off
</LocationMatch>

</VirtualHost>

<VirtualHost *:443>
	ServerAdmin lucy@ProcrasDonate.com
	ServerName  ProcrasDonate.com
	ServerAlias ProcrasDonate.org
	ServerAlias ProcrastDonate.com
	ServerAlias ProcrastDonate.org
	ServerAlias www.ProcrasDonate.com
	ServerAlias www.ProcrasDonate.org
	ServerAlias www.ProcrastDonate.com
	ServerAlias www.ProcrastDonate.org

        DocumentRoot /var/www/
	<Directory />
		Options FollowSymLinks
		AllowOverride None
	</Directory>
	<Directory /var/www/>
		Options Indexes FollowSymLinks MultiViews
		AllowOverride None
		Order allow,deny
		allow from all
	</Directory>

	#RedirectMatch ^/$ /pd/
	#Redirect /robots.txt /procrasdonate_media/txt/robots.txt

        ErrorLog /var/log/apache2/procrasdonate.com/error.log
        LogLevel warn
        CustomLog /var/log/apache2/procrasdonate.com/access.log combined
        ServerSignature On

        LoadModule alias_module modules/mod_alias.so
        Alias /media /usr/local/django_src/django/contrib/admin/media/
        Alias /procrasdonate_media /var/sites/ProcrasDonate/media
        Alias /robots.txt /var/sites/ProcrasDonate/media/txt/robots.txt
        Alias / /var/sites/ProcrasDonate/public/dispatch.fcgi/


	SSLEngine on
        SSLOptions +StrictRequire
	# from gandi.net ca
        SSLCertificateFile /etc/ssl/certs/cert-procrasdonate.com.crt
        SSLCertificateKeyFile /etc/ssl/private/monserveur.key 
	SSLCACertificateFile /etc/ssl/certs/GandiStandardSSLCA.pem

	# self signed
        #SSLCertificateFile /etc/ssl/certs/server.crt
        #SSLCertificateKeyFile /etc/ssl/private/server.key 

        AddType text/javascript .js
	AddType application/x-xpinstall .xpi

        ExpiresActive On
        ExpiresByType text/javascript "access plus 2 hours"
        ExpiresByType image/gif  "access plus 2 days"
        ExpiresByType image/jpeg "access plus 2 days"
        ExpiresByType text/css  "access plus 2 hours"
        ExpiresByType image/png  "access plus 2 days"
	ExpiresByType application/x-shockwave-flash "access plus 1 week"
	ExpiresByType application/x-xpinstall "access plus 0 minutes"
	ExpiresByType text/xml "access plus 0 minutes"

<LocationMatch "/get/data/*">
  ExpiresActive Off
</LocationMatch>

<LocationMatch "/procrasdonate_media/rdf/*">
  ExpiresActive Off
</LocationMatch>

<LocationMatch "/procrasdonate_media/xpi/*">
  ExpiresActive Off
</LocationMatch>

</VirtualHost>
