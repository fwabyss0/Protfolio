"""
services/calculator_service.py
Safe calculator service supporting basic math, trigonometry, powers, factorials, logs, etc.
"""
from __future__ import annotations

import ast
import math
import operator
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_SAFE_BINOP = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}

_SAFE_UNARYOP = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}

_ALLOWED_NAMES = {
    "sqrt": math.sqrt,
    "sin": math.sin,
    "cos": math.cos,
    "tan": math.tan,
    "log": math.log10,
    "log10": math.log10,
    "ln": math.log,
    "abs": abs,
    "pi": math.pi,
    "e": math.e,
    "factorial": math.factorial,
}


def _eval_node(node: ast.AST) -> float:
    if isinstance(node, ast.Expression):
        return _eval_node(node.body)
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return float(node.value)
        raise ValueError(f"Unsupported constant: {node.value}")
    if isinstance(node, ast.Num):  # pragma: no cover - Python <3.8 compat
        return float(node.n)
    if isinstance(node, ast.BinOp):
        op_type = type(node.op)
        if op_type not in _SAFE_BINOP:
            raise ValueError(f"Unsupported operator: {op_type.__name__}")
        left = _eval_node(node.left)
        right = _eval_node(node.right)
        return _SAFE_BINOP[op_type](left, right)
    if isinstance(node, ast.UnaryOp):
        op_type = type(node.op)
        if op_type not in _SAFE_UNARYOP:
            raise ValueError(f"Unsupported unary operator: {op_type.__name__}")
        return _SAFE_UNARYOP[op_type](_eval_node(node.operand))
    if isinstance(node, ast.Call):
        if not isinstance(node.func, ast.Name):
            raise ValueError("Only direct function calls are allowed")
        func_name = node.func.id
        if func_name not in _ALLOWED_NAMES:
            raise ValueError(f"Function not allowed: {func_name}")
        args = [_eval_node(arg) for arg in node.args]
        return float(_ALLOWED_NAMES[func_name](*args))
    if isinstance(node, ast.Name):
        if node.id not in _ALLOWED_NAMES:
            raise ValueError(f"Name not allowed: {node.id}")
        val = _ALLOWED_NAMES[node.id]
        return float(val) if isinstance(val, (int, float)) else val
    raise ValueError(f"Unsupported expression: {type(node).__name__}")


def _safe_calculate(expr: str) -> Optional[float]:
    expr = expr.strip()
    if not expr:
        return None
    # factorial shorthand: 5! -> factorial(5)
    expr = re.sub(r'(\d+)!', r'factorial(\1)', expr)
    try:
        tree = ast.parse(expr, mode="eval")
        result = _eval_node(tree)
        if isinstance(result, complex):
            return None
        return result
    except Exception as exc:
        logger.debug("Calculator parse error for '%s': %s", expr, exc)
        return None


def _fmt_number(value: float) -> str:
    if value != value:  # NaN
        return str(value)
    if value == float("inf") or value == float("-inf"):
        return str(value)
    if value == int(value) and abs(value) < 1e15:
        return str(int(value))
    return f"{value:.6g}"


def calculate(message: str) -> Optional[str]:
    """
    Try to evaluate a math expression from the message.
    Returns a short formatted string or None if not calculable.
    """
    original = message.strip()
    expr = original.lower()

    # Strip natural language wrappers
    for prefix in ["what is", "calculate", "solve", "how much is", "compute", "evaluate"]:
        if expr.startswith(prefix):
            expr = expr[len(prefix):].strip()
            break
    expr = expr.rstrip("?").strip()

    if not expr:
        return None

    # Percentage: 15% of 200
    pct = re.match(r'^(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)$', expr)
    if pct:
        p = float(pct.group(1))
        total = float(pct.group(2))
        result = (p / 100.0) * total
        return f"🧮 `{p}% of {total}` = **{_fmt_number(result)}**"

    # Word-based replacements
    replacements = [
        ("plus", "+"), ("minus", "-"), ("times", "*"), ("multiplied by", "*"),
        ("divided by", "/"), ("over", "/"), ("power of", "**"), ("x", "*"),
    ]
    for word, sym in replacements:
        expr = expr.replace(word, sym)
    expr = expr.replace("^", "**")

    result = _safe_calculate(expr)
    if result is not None:
        return f"🧮 `{original}` = **{_fmt_number(result)}**"

    return None


def is_calculator_query(message: str) -> bool:
    msg = message.lower()
    has_number = bool(re.search(r'\d', msg))
    keywords = ["calculate", "solve", "math", "what is", "how much", "%", "+", "-", "*", "/", "^", "sqrt", "sin", "cos", "tan", "log"]
    return has_number and any(k in msg for k in keywords)
