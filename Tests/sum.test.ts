function sum (a: number, b: number)
{
    return a + b;
}
describe("Test de suma", () => {
    it(`Debería resultar ${5}`, () =>{
        expect(sum(2, 3)).toBe(5);
    });
});