import html2canvas from "html2canvas";

export function takeAndDownloadImage(objetivo: HTMLElement)
{
    html2canvas(objetivo) // Llamar a html2canvas y pasarle el elemento
    .then(canvas => {
      // Cuando se resuelva la promesa traerá el canvas
      // Crear un elemento <a>
      let enlace = document.createElement('a');
      enlace.download = "Captura de página web - Parzibyte.me.png";
      // Convertir la imagen a Base64
      enlace.href = canvas.toDataURL();
      // Hacer click en él
      enlace.click();
    });
}