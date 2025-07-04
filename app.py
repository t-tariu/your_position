from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# Load data from JSON file
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/questions')
def get_questions():
    return jsonify(data['questions'])

@app.route('/api/results')
def get_results():
    return jsonify(data['results'])

@app.route('/api/submit', methods=['POST'])
def submit():
    answers = request.json.get('answers')
    # Simple calculation logic (can be customized)
    # This example assumes each answer choice (0, 1, 2...) corresponds to a type
    # and we find the most frequently chosen type.
    
    # Initialize a dictionary to count the occurrences of each answer type
    type_counts = {}
    for answer in answers:
        # Assuming the 'type' is directly the value of the answer
        # For example, if the user chose the first option (value 0), it increments the count for type '0'
        type_counts[answer] = type_counts.get(answer, 0) + 1
        
    # Find the type that was chosen most often
    if not type_counts:
        # Handle the case where no answers were provided
        result_type_key = "default" # Or handle as an error
    else:
        # Find the answer type with the maximum count
        result_type_key = max(type_counts, key=type_counts.get)

    # Retrieve the corresponding result from the data
    result = next((res for res in data['results'] if res['type'] == str(result_type_key)), None)
    
    if result:
        return jsonify(result)
    else:
        # Fallback or error if the result type doesn't exist
        return jsonify({"error": "Result not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
