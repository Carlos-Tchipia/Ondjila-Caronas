<?php
class Validator {
    public static function validate(array $data, array $rules): array {
        $errors = [];
        
        foreach ($rules as $field => $ruleString) {
            $fieldRules = explode('|', $ruleString);
            $value = isset($data[$field]) ? $data[$field] : null;

            foreach ($fieldRules as $rule) {
                // required rule
                if ($rule === 'required' && ($value === null || $value === '')) {
                    $errors[$field][] = "O campo {$field} é obrigatório.";
                }
                
                // only check further rules if value exists
                if ($value !== null && $value !== '') {
                    if ($rule === 'numeric' && !is_numeric($value)) {
                        $errors[$field][] = "O campo {$field} deve ser numérico.";
                    }
                    if ($rule === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $errors[$field][] = "O campo {$field} não é um email válido.";
                    }
                    if (str_starts_with($rule, 'in:')) {
                        $allowed = explode(',', substr($rule, 3));
                        if (!in_array($value, $allowed)) {
                            $errors[$field][] = "O campo {$field} deve ser um dos seguintes valores: " . implode(', ', $allowed);
                        }
                    }
                }
            }
        }
        
        return $errors;
    }
}
