# my-project

A data charts and analyse tool.

The Folder `vue` contains the web app, and `electron` has the desktop container. Please go into them for their individual instructinos.


## Technologies

- Web: 
  - Javascript framework: [Vue.js](https://vuejs.org/)
  - CSS: [Bulma](https://bulma.io/)
  - Icons: [Font Awesome 5](https://fontawesome.com/)
  - Desktop App: [Electron](https://www.electronjs.org/)

- Charts:
  - [ECharts](https://echarts.apache.org/en/index.html)
  - [C3.js](https://c3js.org/)
  - [Parallel Coordinates](https://github.com/BigFatDog/parcoords-es)

- Compute:
  - [PCA](https://github.com/mljs/pca)


## To be done:

1. Replace CSV parser with [csv-parser](https://www.npmjs.com/package/csv-parser) or [csv-parse](https://csv.js.org/parse/)
2. User can write option in Javascript like these [examples](https://echarts.apache.org/examples/en/index.html) to fully control and draw ECharts with all features.
3. Add more sources for destop application, for example [Sqlite](https://www.npmjs.com/package/sqlite3), [MySql](https://www.npmjs.com/package/mysql), [Postgres](https://node-postgres.com/) and [AWS](https://aws.amazon.com/sdk-for-javascript/).
4. The app seems responsing slowly when load big amount of data. Investigate the bottleneck and resolve it if possible.
5. Load data and draw charts dynamically.
