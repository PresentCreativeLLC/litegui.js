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