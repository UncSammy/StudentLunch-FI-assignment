const target = document.querySelector("#target");

const userAgent = navigator.userAgent;

let browserName = "Unknown";
let browserVersion = "Unknown";

if (userAgent.includes("Edg/")) {
    browserName = "Microsoft Edge";
    browserVersion = userAgent.match(/Edg\/([\d.]+)/)[1];
} else if (userAgent.includes("Chrome/")) {
    browserName = "Google Chrome";
    browserVersion = userAgent.match(/Chrome\/([\d.]+)/)[1];
} else if (userAgent.includes("Firefox/")) {
    browserName = "Mozilla Firefox";
    browserVersion = userAgent.match(/Firefox\/([\d.]+)/)[1];
} else if (userAgent.includes("Safari/")) {
    browserName = "Safari";
    browserVersion = userAgent.match(/Version\/([\d.]+)/)[1];
}

let operatingSystem = "Unknown";

if (userAgent.includes("Windows")) {
    operatingSystem = "Windows";
} else if (userAgent.includes("Mac OS")) {
    operatingSystem = "macOS";
} else if (userAgent.includes("Android")) {
    operatingSystem = "Android";
} else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    operatingSystem = "iOS";
} else if (userAgent.includes("Linux")) {
    operatingSystem = "Linux";
}

const now = new Date();

const date = now.toLocaleDateString("fi-FI", {
    day: "numeric",
    month: "long",
    year: "numeric"
});

const time = now.toLocaleTimeString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit"
});

target.innerHTML = `
    <p>Browser: ${browserName}, version ${browserVersion}</p>
    <p>Operating system: ${operatingSystem}</p>
    <p>Screen size: ${screen.width} x ${screen.height}</p>
    <p>Available screen space: ${screen.availWidth} x ${screen.availHeight}</p>
    <p>Date: ${date}</p>
    <p>Time: ${time}</p>
`;