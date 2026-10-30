FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-install-project

COPY backend/src ./src
EXPOSE 5000
CMD ["uv", "run", "--no-sync", "gunicorn", "--bind", "0.0.0.0:5000", "src.main:app"]
