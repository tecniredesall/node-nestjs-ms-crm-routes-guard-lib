FROM carlososiel/node-lts-slim as build
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --quiet 
ADD . /usr/src/app
RUN npm run build

#final container
FROM  carlososiel/node-lts-slim
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .

CMD ["node", "dist/main"]
EXPOSE 3000
