from flask import Flask, redirect, url_for,render_template, request, jsonify

app=Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/getWeatherData')
def queryWeather():
    long = request.args.get('long') 
    lat = request.args.get('lat') 
    return jsonify(
        confirmation="WORKED",
        m_long=long,
        m_lat= lat 
    )

if __name__ == '__main__':
    app.run(debug=True)