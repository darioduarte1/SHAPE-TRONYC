import requests

API_KEY = "mlsn.94bc535593833044ce9321a97b536ba64f88efb2e4140480baeab7eb38d49731"
url = "https://api.mailersend.com/v1/email"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "from": {"email": "shapetronyc@gmail.com"},
    "to": [{"email": "darioduarte1991@gmail.com"}],
    "subject": "Prueba desde MailerSend API",
    "text": "Este es un correo de prueba."
}

response = requests.post(url, headers=headers, json=data)

if response.status_code == 202:
    print("Correo enviado con éxito.")
else:
    print(f"Error al enviar correo: {response.status_code} - {response.json()}")