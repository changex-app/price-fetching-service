# price-fetching-service

This is a backend service responsible for fetching data from CoinGecko and providing it to the Apps.

You can run the app with :  npm run devStart

## Api calls HEALTHCHECK: 
- /status/db - Checks if the database is connected

## Fetches data such as:

- coins/markets?ids={coinId's}&vs_currency={usd / eur} - returns the specific coin market data in USD or EUR , based on the vs_currency param.
'coinId' parameter  can be one or many. If the coinId does not exists in the database , once it is requested , it will be add and data for it will be tracked.

Example - > /coins/markets?ids=bitcoin%2Chydra&vs_currency=usd


- coins/:coinId/market_chart?days={number}&vs_currency={usd / eur} - returns the coin price range base on the 'days' parameter in USD or EUR based on the vs_currency parameter.

 Example - > /coins/changex/market_chart?days=30&vs_currency=usd

'days' param value can be : 
- - 1 - retuns daily data
- - 7 - retuns weekly data
- - 30 - retuns monthly data
- - 365 - retuns yearly data

## LINKS

- https://api.coingecko.com/api/v3/
