export class LoadingSpinner {

    constructor(message) {
        this.message = message;

        this.spinnerDiv = document.createElement("div");
        spinnerDiv.className = 'loader';
        spinnerDiv.style.display = 'none';
        document.body.appendChild(this.spinnerDiv);

        const style = document.createElement('style');
        style.innerHTML = `
            .loader {
                width: 120px;        /* the size */
                padding: 15px;       /* the border thickness */
                background: #07e8d6; /* the color */
            
                aspect-ratio: 1;
                border-radius: 50%;
                --_m: 
                    conic-gradient(#0000,#000),
                    linear-gradient(#000 0 0) content-box;
                -webkit-mask: var(--_m);
                    mask: var(--_m);
                -webkit-mask-composite: source-out;
                    mask-composite: subtract;
                box-sizing: border-box;
                animation: load 1s linear infinite;
            }
            
            @keyframes load {
                to{transform: rotate(1turn)}
            }
        `;
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    show() {
    }

    hide() {
    }
}