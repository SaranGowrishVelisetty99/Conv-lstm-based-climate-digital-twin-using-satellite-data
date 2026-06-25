import tensorflow as tf

from backend.core.config import MODEL_PATH


_model = None

def load_model():
    global _model
    if _model is None:
        _model = tf.keras.models.load_model(str(MODEL_PATH))
    return _model

def get_model():
    return load_model()

def model_info():
    model = load_model()
    return {
        "input_shape": list(model.input_shape),
        "output_shape": list(model.output_shape),
        "params": model.count_params(),
        "layers": len(model.layers),
    }
