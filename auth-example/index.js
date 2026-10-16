let iframePromise;
function getIFrame() {
    if (!iframePromise) {
        iframePromise = new Promise(resolve => {
            const iframe = document.createElement("iframe");
            iframe.src = "https://auth.evandor.de/new/iframe.html";
            iframe.style.display = "none";
            iframe.onload = () => resolve(iframe);
            document.body.appendChild(iframe);
        });
    }
    return iframePromise;
}
//TODO initialize lazily
const messageWaiters = new Map();
let nextMessageId = 1;
window.addEventListener("message", msg => {
    const id = msg.data.id;
    messageWaiters.get(id)?.(msg.data);
    messageWaiters.delete(id);
});
async function sendMessage(msg) {
    const iframe = await getIFrame();
    const id = nextMessageId++;
    return await new Promise(resolve => {
        messageWaiters.set(id, resolve);
        iframe.contentWindow?.postMessage({ ...msg, id }, "*");
    });
}
function login() {
    const url = 'https://auth.evandor.de/new/login.html';
    const params = new URLSearchParams({ redirectUrl: location.href });
    location.href = `${url}?${params.toString()}`;
}
async function getToken(audience) {
    const result = await sendMessage({ type: "getToken", audience });
    return result.token;
}
async function getRootToken() {
    const result = await sendMessage({ type: "getRootToken" });
    return result.token;
}

export { getRootToken, getToken, login };
