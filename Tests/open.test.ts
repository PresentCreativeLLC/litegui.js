let windowSpy: any;

function openStatementsReport(contactIds: string)
{
    window.open(`a_url_${contactIds}`);
}
beforeEach(() => {
  windowSpy = jest.spyOn(window, "window", "get");
});

afterEach(() => {
  windowSpy.mockRestore();
});

describe('Opens an html and add stuff on it', () => {
  test('should return file:///D:/Users/Mario%20Villalvazo/Documents/GitHub/litegui.js/prueba.html', () => {
      windowSpy.mockImplementation(() => ({
          location: {
            origin: "https://google.com"
          }
        }));
      
      expect(window.location.origin).toEqual("https://google.com");
  });
    
  test('correct url is called', () => {
      window.open = jest.fn();
      window.open('https://google.com');
      expect(window.open).toBeCalled();
  });

  test('should be undefined.', () => {
      windowSpy.mockImplementation(() => undefined);
  
      expect(window).toBeUndefined();
  });
});