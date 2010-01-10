import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import settings

def send_email(sender, recipient, subject, text, html):
    if settings.DJANGO_SERVER:
        print "="*60
        print "FROM:", sender
        print "TO:", recipient
        print "SUBJECT:", subject
        print "========= TEXT MESSAGE =========\n", text
        print "\n\n========= HTML MESSAGE ==========\n", html
    else:
        # Create message container - the correct MIME type is multipart/alternative.
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = recipient
        
        # Record the MIME types of both parts - text/plain and text/html.
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        
        # Attach parts into message container.
        # According to RFC 2046, the last part of a multipart message, in this case
        # the HTML message, is best and preferred.
        msg.attach(part1)
        msg.attach(part2)
        
        # Send the message via local SMTP server.
        s = smtplib.SMTP('localhost')
        # sendmail function takes 3 arguments: sender's address, recipient's address
        # and message to send - here it is sent as one string.
        s.sendmail(sender, recipient, msg.as_string())
        s.quit()
