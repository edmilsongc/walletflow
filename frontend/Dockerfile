FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

COPY frontend/pyproject.toml frontend/uv.lock ./
RUN uv sync --frozen --no-install-project

COPY frontend/src ./src
EXPOSE 8080
CMD ["uv", "run", "--no-sync", "gunicorn", "--chdir", "src", "--bind", "0.0.0.0:8080", "main:app"]
