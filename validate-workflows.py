#!/usr/bin/env python3
import yaml
import sys
import os

def validate_yaml_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            yaml.safe_load(f)
        return True, None
    except yaml.YAMLError as e:
        return False, f"YAML Error: {e}"
    except Exception as e:
        return False, f"Error: {e}"

def main():
    workflow_files = [
        '.github/workflows/binaries.yml',
        '.github/workflows/build-linux.yml', 
        '.github/workflows/build-test.yml',
        '.github/workflows/build-custom.yml'
    ]
    
    all_valid = True
    
    print("Validating GitHub workflow files...")
    
    for filepath in workflow_files:
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            continue
            
        is_valid, error = validate_yaml_file(filepath)
        
        if is_valid:
            print(f"✅ {filepath} - Valid")
        else:
            print(f"❌ {filepath} - {error}")
            all_valid = False
    
    if all_valid:
        print("All workflow files are valid!")
        return 0
    else:
        print("Some workflow files have errors!")
        return 1

if __name__ == "__main__":
    sys.exit(main())