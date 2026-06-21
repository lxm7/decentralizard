# arm64 to match the rest of the stack. @resvg/resvg-js pulls its native
# linux-arm64-gnu binary on `npm install` when built under --platform linux/arm64.
FROM public.ecr.aws/lambda/nodejs:20-arm64

WORKDIR ${LAMBDA_TASK_ROOT}

COPY package.json ./
RUN npm install --omit=dev

# satori needs a real font file (ttf/otf/woff — not woff2). Pull the static
# Inter 700 woff out of the installed @fontsource package, no network at runtime.
RUN mkdir -p fonts \
  && cp node_modules/@fontsource/inter/files/inter-latin-700-normal.woff fonts/inter-700.woff

COPY index.mjs ./

CMD [ "index.handler" ]
