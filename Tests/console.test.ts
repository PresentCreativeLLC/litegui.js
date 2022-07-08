/*
import { Console } from "../src/console";
const utilities = require("../src/Utilities");

function Construct (options: any)
{
    return new Console(options);
}

describe("Test de creacion de console", () => {
    const options = { prompt: "]" };
    it(`Debería crear la consola`, () =>
    {
        expect(Construct(options)).toBeDefined();
    });
});

describe('processKeyDown', () => {
    const options = { prompt: "]" };
    const console = Construct(options);
    it(`Debería fingir que presioné E`, () =>
    {
        expect(console.processKeyDown(new KeyboardEvent('keydown',
        {
            'key': 'E'
        })));
    });
});

describe('addMessage', () => {
    const options = { prompt: "]" };
    const console = Construct(options);
    it(`Debería debería mostrar el mensaje "Hola mundo"`, () =>
    {
        expect(console.addMessage("Hola mundo", "msglog"));
    });
});

describe('log', () => {
    const options = { prompt: "]" };
    const console = Construct(options);
    it(`Debería mostrar un mensaje desconocido`, () =>
    {
        expect(console.log());
    });
});

describe('warn', () => {
    const options = { prompt: "]" };
    const console = Construct(options);
    it(`Debería mostrar un warn desconocido`, () =>
    {
        expect(console.warn());
    });
});

describe('error', () => {
    const options = { prompt: "]" };
    const console = Construct(options);
    it(`Debería mostrar un error desconocido`, () =>
    {
        expect(console.error());
    });
});

describe('clear', () => {
    const options = { prompt: "]" };
    const console = Construct(options);
    it(`Debería `, () =>
    {
        expect(console.clear());
    });
});

describe('onAutocomplete', () => {
    const options = { prompt: "]" };
    const console = Construct(options);
    it(`Debería autocompletar "Hola" pero está vacío`, () =>
    {
        expect(console.onAutocomplete("Hola"));
    });
});

describe('onProcessCommand', () => {
    const options = { prompt: "]" };
    const console = Construct(options);
    it(`Debería procesar "Hola" pero está vacío`, () =>
    {
        expect(console.onProcessCommand("Hola"));
    });
});

describe('This should try to create html', () => {
    test('correct url is called', async () =>
    {
        await utilities.takeScreenshot(
            'file:///D:/Users/Mario%20Villalvazo/Documents/GitHub/litegui.js/examples/testing.html', 'consoleTesting.png');
        expect(1).toBe(1);
    });
});
*/