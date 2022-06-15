import { Panel } from "../src/panel";
function Construct (id: string, options: any)
{
    return new Panel(id, options);
}

describe("Test de creacion de panel", () => {
    const options = { className: "panel-header", title: "Hola mundo", content: "Hola, esta es una prueba de creación de panel",
    width: "300", height: "150", position: [10, 10], scroll: true};
    it(`Debería resultar ${5}`, () =>{
        expect(Construct("Panel01", options)).toBeDefined();
    });
});

describe("Test de add de panel", () => {
    const options = { className: "panel-header", title: "Hola mundo", content: "Hola, esta es una prueba de creación de panel",
    width: "300", height: "150", position: [10, 10], scroll: true};
    const panel0 = Construct("Panel01", options);

    options.title = "Hola mundo 2";
    options.content = "Hola, este es el panel que se va a agregar";
    options.position = [10, 160];
    it('Debería agregar una wea al panel01', () => {
        expect(panel0.add(Construct("Panel01_0", options)));
    });
});
describe('Test de clear de panel', () => {
    const options = { className: "panel-header", title: "Hola mundo", content: "Hola, esta es una prueba de creación de panel",
    width: "300", height: "150", position: [10, 10], scroll: true};
    const panel0 = Construct("Panel01", options);
    it('Debería limpiar al panel01', () => {
        expect(panel0.clear());
    });
});