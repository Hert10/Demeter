import sys
from process import ClimateRiskAnalyzer

def main():
    if len(sys.argv) != 3:
        print("Usage: python process_climate_data.py <input_file> <output_file>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    analyzer = ClimateRiskAnalyzer()
    success = analyzer.process_file(input_path, output_path)
    
    if success:
        print(output_path) 
    else:
        print("[]")  
        sys.exit(1)

if __name__ == "__main__":
    main()