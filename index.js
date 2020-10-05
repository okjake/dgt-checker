const puppeteer = require("puppeteer");

const DGT_URL =
  "https://sedeapl.dgt.gob.es:7443/WEB_NCIT_CONSULTA/solicitarCita.faces";

const LOCATIONS = [
  ["Barcelona", "27"],
  ["Tarragona", "67"],
];

(async () => {
  for (let i = 0; i < LOCATIONS.length; i++) {
    const location = LOCATIONS[i];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(DGT_URL);
    await page.select("#publicacionesForm\\:oficina", location[1]);
    await page.waitForNavigation();
    await page.select("#publicacionesForm\\:tipoTramite", "3");
    await page.waitForNavigation();
    await page.select("#publicacionesForm\\:pais", "50");
    await page.click(".btnContinuarSolicitarCita input");
    await page.waitForNavigation();

    const content = await page.content();
    const found =
      content.match(
        "El horario de atención al cliente está completo para los próximos dias."
      ) ||
      content.match(
        "Estamos recibiendo un número muy elevado de accesos que no nos permiten procesar tu petición"
      );

    if (!found) {
      await page.screenshot({ path: "state.png" });
      console.log(
        `There are potential slots available in ${location[0]}. Check state.png`
      );
      await browser.close();
      process.exit(0);
    } else {
      console.log(`No slots available in ${location[0]}`);
      await browser.close();
    }
  }
  process.exit(1);
})();
