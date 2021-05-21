npx nodemon --watch "**" --ext "ts,json" --ignore "src/**/*.spec.ts" --exec "npx ts-node -O '{\"module\":\"commonjs\"}' create-order-items.ts $1"

