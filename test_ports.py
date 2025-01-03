import sendgrid
from sendgrid.helpers.mail import Mail

sg = sendgrid.SendGridAPIClient(api_key="mlsn.94bc535593833044ce9321a97b536ba64f88efb2e4140480baeab7eb38d49731")
from_email = "shapetronyc@gmail.com"
to_email = "darioduarte1991@gmail.com"
subject = "Prueba API de SendGrid"
content = "Este es un correo de prueba enviado usando la API de SendGrid."

mail = Mail(from_email=from_email, to_emails=to_email, subject=subject, plain_text_content=content)

try:
    response = sg.send(mail)
    print(f"Correo enviado. Status code: {response.status_code}")
except Exception as e:
    print(f"Error al enviar correo: {e}")