class AppException(Exception):
    def __init__(
        self,
        message: str,
        http_code: int = 400,
        error_code: str | None = None,
    ):
        self.message = message
        self.http_code = http_code
        self.error_code = error_code