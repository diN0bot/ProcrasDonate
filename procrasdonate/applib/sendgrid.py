from procrasdonate.applib import SmtpApiHeader
from django.utils import simplejson as json
 
hdr = SmtpApiHeader.SmtpApiHeader()
receiver = ['lucy@bilumi.org','cwallardo@gmail.com','messenger@bilumi.org']
times = ['1pm', '2pm', '3pm']
names = ['lucy', 'clay', 'messenger']
 
 
hdr.addTo(receiver)
hdr.addSubVal('<time>', times)
hdr.addSubVal('<name>', names)
hdr.addFilterSetting('subscriptiontrack', 'enable', 1)
hdr.addFilterSetting('twitter', 'enable', 1)
hdr.setUniqueArgs({'test':1, 'foo':2})
a = hdr.asJSON()
a = hdr.as_string()
print a


#!/usr/bin/python
 
import SmtpApiHeader
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header
 
hdr = SmtpApiHeader.SmtpApiHeader()
 
# The list of addresses this message will be sent to
receiver = ['isaac@example', 'tim@example', 'jose@example']
 
# The names of the recipients
times = ['1pm', '2pm', '3pm']
 
# Another subsitution variable
names = ['Isaac', 'Tim', 'Jose']
 
# Set all of the above variables
hdr.addTo(receiver)
hdr.addSubVal('<time>', times)
hdr.addSubVal('<name>', names)
 
# Specify that this is an initial contact message
hdr.setCategory("initial")
 
# Enable a text footer and set it
hdr.addFilterSetting('footer', 'enable', 1)
hdr.addFilterSetting('footer', "text/plain", "Thank you for your business")
 
# fromEmail is your email
# toEmail is recipient's email address
# For multiple recipient e-mails, the 'toEmail' address is irrelivant
fromEmail =  'you@yourdomain.com'
toEmail = 'doesntmatter@nowhere.com'
 
# Create message container - the correct MIME type is multipart/alternative.
msg = MIMEMultipart('alternative')
msg['Subject'] = "Contact Response for <name> at <time>"
msg['From'] = fromEmail
msg['To'] = toEmail
msg["X-SMTPAPI"] = hdr.asJSON()
 
# Create the body of the message (a plain-text and an HTML version).
# text is your plain-text email
# html is your html version of the email
# if the reciever is able to view html emails then only the html
# email will be displayed
text = "Hi <name>!\nHow are you?\n"
html = """\
<html>
  <head></head>
  <body>
    <p>Hi! <name><br>-
       How are you?<br>
    </p>
  </body>
</html>
"""
 
# Record the MIME types of both parts - text/plain and text/html.
part1 = MIMEText(text, 'plain')
part2 = MIMEText(html, 'html')
 
# Attach parts into message container.
msg.attach(part1)
msg.attach(part2)
 
# Login credentials
username = 'yourlogin@sendgrid.net'
password = 'yourpassword'
 
# Open a connection to the SendGrid mail server
s = smtplib.SMTP('smtp.sendgrid.net')
 
# Authenticate
s.login(username, password)
 
# sendmail function takes 3 arguments: sender's address, recipient's address
# and message to send - here it is sent as one string.
s.sendmail(fromEmail, toEmail, msg.as_string())
 
s.quit()
