FROM node:24-alpine AS build
WORKDIR /app
ARG VITE_WORDCHAIN_API_URL
ENV VITE_WORDCHAIN_API_URL=$VITE_WORDCHAIN_API_URL
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
