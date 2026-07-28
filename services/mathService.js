function isMathQuery(message) {
    const msg = message.trim().toLowerCase();

    // Direct math keywords
    if (msg.startsWith('calculate') || msg.startsWith('solve') || msg.startsWith('math:') || msg.includes('what is') || msg.includes('how much is')) {
        if (/[0-9]/.test(msg)) return true;
    }

    // Check for math patterns like "5 + 5", "100 / 4", "15% of 200", "sqrt(64)"
    const mathPattern = /(?:^|\s)(\(?\d+(\.\d+)?\)?\s*[\+\-\*\/\%\^]\s*\(?\d+(\.\d+)?\)?(\s*[\+\-\*\/\%\^]\s*\(?\d+(\.\d+)?\)?)*)(?:\s*|\?|$)/;
    const percentagePattern = /\d+(\.\d+)?%\s*(?:of)\s*\d+(\.\d+)?/i;
    const functionPattern = /(?:sqrt|sin|cos|tan|abs|log)\s*\(\s*\d+(\.\d+)?\s*\)/i;

    return mathPattern.test(msg) || percentagePattern.test(msg) || functionPattern.test(msg);
}

function evaluateMath(expression) {
    try {
        let expr = expression.trim().toLowerCase();

        // Handle "what is X" or "calculate X"
        expr = expr.replace(/^what\s+is\s+/i, '')
                   .replace(/^calculate\s+/i, '')
                   .replace(/^solve\s+/i, '')
                   .replace(/^how\s+much\s+is\s+/i, '')
                   .replace(/\?/g, '')
                   .trim();

        // Handle percentage: "15% of 200" => "(15 / 100) * 200"
        const pctMatch = expr.match(/^(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)$/i);
        if (pctMatch) {
            const pct = parseFloat(pctMatch[1]);
            const total = parseFloat(pctMatch[2]);
            const val = (pct / 100) * total;
            return {
                original: expression,
                cleanExpr: `${pct}% of ${total}`,
                result: Number.isInteger(val) ? val.toString() : val.toFixed(4).replace(/\.?0+$/, '')
            };
        }

        // Word conversions
        expr = expr.replace(/\bplus\b/g, '+')
                   .replace(/\bminus\b/g, '-')
                   .replace(/\btimes\b/g, '*')
                   .replace(/\bmultiply(?:ed)?\s+by\b/g, '*')
                   .replace(/\bdivided?\s+by\b/g, '/')
                   .replace(/\bover\b/g, '/')
                   .replace(/\bpower\s+of\b/g, '^')
                   .replace(/\bx\b/g, '*');

        // Exponentiation ^ to **
        expr = expr.replace(/\^/g, '**');

        // Math functions
        expr = expr.replace(/\bsqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
                   .replace(/\bsin\(([^)]+)\)/g, 'Math.sin($1)')
                   .replace(/\bcos\(([^)]+)\)/g, 'Math.cos($1)')
                   .replace(/\btan\(([^)]+)\)/g, 'Math.tan($1)')
                   .replace(/\babs\(([^)]+)\)/g, 'Math.abs($1)')
                   .replace(/\blog\(([^)]+)\)/g, 'Math.log10($1)')
                   .replace(/\bpi\b/g, 'Math.PI')
                   .replace(/\be\b/g, 'Math.E');

        // Sanitize: strip known safe function wrappers, then allow only numbers/operators/parens
        const sanitized = expr.replace(/Math\.(?:sqrt|sin|cos|tan|log10|PI|E)/g, '');
        if (!/^[0-9\+\-\*\/\%\.\(\)\s]+$/.test(sanitized)) {
            return null;
        }

        // Safe Function evaluation
        const evalFn = new Function(`return (${expr});`);
        const resultVal = evalFn();

        if (typeof resultVal === 'number' && !isNaN(resultVal) && isFinite(resultVal)) {
            const formatted = Number.isInteger(resultVal) ? resultVal.toString() : resultVal.toFixed(6).replace(/\.?0+$/, '');
            return {
                original: expression,
                cleanExpr: expr.replace(/Math\./g, ''),
                result: formatted
            };
        }
    } catch (e) {
        return null;
    }
    return null;
}

function getMathResponse(message) {
    const mathResult = evaluateMath(message);
    if (!mathResult) return null;

    return `### 🧮 Math Result\n` +
           `- **Calculation:** \`${mathResult.cleanExpr}\`\n` +
           `- **Result:** **\`${mathResult.result}\`**`;
}

module.exports = {
    isMathQuery,
    evaluateMath,
    getMathResponse
};
