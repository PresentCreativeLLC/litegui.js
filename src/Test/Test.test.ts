
function sum(_num1: number, _num2: number)
{
    return _num1 + _num2;
}
describe('Test de suma', () => {
    it(`should result ${5}`, () => {
        expect(sum(2, 3)).toBe(5);
    });
});