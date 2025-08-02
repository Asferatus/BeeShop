# Importăm bibliotecile necesare pentru Flask și funcționalități
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import json

# Inițializăm aplicația Flask
app = Flask(__name__)

# Configurăm cheia secretă pentru sesiuni
app.secret_key = 'beeshop_secret_key_2024'

# Date statice pentru produse (în loc de baza de date)
PRODUCTS = [
    {
        'id': 1,
        'name': 'Miere de Salcâm din Moldova',
        'description': 'Miere naturală de salcâm din Republica Moldova, bogată în vitamine și minerale. Perfectă pentru îndulcirea ceaiului sau pentru consum direct.',
        'price': 45.00,
        'image': 'salcam.png',
        'category': 'Miere',
        'stock': 50
    },
    {
        'id': 2,
        'name': 'Miere de Tei Moldovenească',
        'description': 'Miere de tei cu proprietăți calmante și sedative, produsă în Moldova. Ideală pentru probleme de somn și relaxare.',
        'price': 55.00,
        'image': 'tei.png',
        'category': 'Miere',
        'stock': 30
    },
    {
        'id': 3,
        'name': 'Ceară de Albine Moldovenească',
        'description': 'Ceară naturală de albine din Republica Moldova pentru fabricarea lumânărilor și produselor cosmetice.',
        'price': 25.00,
        'image': 'ceara.jpg',
        'category': 'Ceară',
        'stock': 100
    },
    {
        'id': 4,
        'name': 'Propolis Moldovenesc',
        'description': 'Propolis natural cu proprietăți antibacteriene și antivirale, colectat din Moldova. Perfect pentru întărirea sistemului imunitar.',
        'price': 85.00,
        'image': 'propolis.jpg',
        'category': 'Propolis',
        'stock': 25
    },
    {
        'id': 5,
        'name': 'Polen de Albine Moldovenesc',
        'description': 'Polen natural de albine din Republica Moldova pentru tratarea problemelor respiratorii și întărirea sistemului imunitar.',
        'price': 65.00,
        'image': 'polen.jpg',
        'category': 'Polen',
        'stock': 40
    },
    {
        'id': 6,
        'name': 'Lumânări de Ceară Moldovenească',
        'description': 'Lumânări naturale din ceară de albine din Republica Moldova, perfecte pentru decor și aromaterapie.',
        'price': 35.00,
        'image': 'luminari.jpg',
        'category': 'Lumânări',
        'stock': 60
    }
]

# Lista pentru stocarea comenzilor (în memorie, pentru demonstrație)
ORDERS = []

# Ruta principală - pagina de start
@app.route('/')
def home():
    """Ruta principală care afișează pagina de start cu produsele"""
    return render_template('index.html', products=PRODUCTS)

# Ruta pentru pagina despre noi
@app.route('/about')
def about():
    """Ruta pentru pagina despre companie și produsele noastre"""
    return render_template('about.html')

# Ruta pentru pagina de contact
@app.route('/contact')
def contact():
    """Ruta pentru pagina de contact"""
    return render_template('contact.html')

# Ruta pentru procesarea comenzilor
@app.route('/place_order', methods=['POST'])
def place_order():
    """Procesează comenzile primite de la frontend"""
    try:
        data = request.get_json()
        
        # Creăm o nouă comandă
        new_order = {
            'id': len(ORDERS) + 1,
            'customer_name': data['name'],
            'customer_email': data['email'],
            'customer_phone': data['phone'],
            'total_amount': data['total'],
            'status': 'pending',
            'created_at': datetime.now().isoformat()
        }
        
        ORDERS.append(new_order)
        
        return jsonify({'success': True, 'order_id': new_order['id']})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Ruta pentru API-ul produselor
@app.route('/api/products')
def get_products():
    """API endpoint pentru obținerea listei de produse"""
    return jsonify(PRODUCTS)

# Ruta pentru obținerea unui produs specific
@app.route('/api/products/<int:product_id>')
def get_product(product_id):
    """API endpoint pentru obținerea unui produs specific"""
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    else:
        return jsonify({'error': 'Produsul nu a fost găsit'}), 404

# Ruta pentru procesarea formularului de contact
@app.route('/contact', methods=['POST'])
def submit_contact():
    """Procesează formularul de contact"""
    try:
        data = request.get_json()
        
        # Aici ar trebui să salvăm mesajul într-o bază de date
        # Pentru moment, doar returnăm succes
        print(f"Mesaj nou de la {data['name']}: {data['message']}")
        
        return jsonify({'success': True, 'message': 'Mesajul a fost trimis cu succes!'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Ruta pentru servirea fișierelor statice (imaginile)
@app.route('/static/images/<filename>')
def serve_image(filename):
    """Servește imaginile din directorul static/images"""
    return app.send_static_file(f'images/{filename}')

# Ruta pentru pagina de eroare 404
@app.errorhandler(404)
def not_found(error):
    """Pagina de eroare 404"""
    return render_template('404.html'), 404

# Ruta pentru pagina de eroare 500
@app.errorhandler(500)
def internal_error(error):
    """Pagina de eroare 500"""
    return render_template('500.html'), 500

# Rulăm aplicația doar dacă fișierul este executat direct
if __name__ == '__main__':
    print("🐝 BeeShop Moldova - Site pentru vânzarea produselor de albine din Republica Moldova")
    print("📱 Accesează site-ul la: http://localhost:5000")
    print("🛑 Apasă Ctrl+C pentru a opri serverul")
    print("-" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000) 