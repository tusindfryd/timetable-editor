window.onload = () => {}

var timetableHTML = document.getElementById("timetable");
var navigationHTML = document.getElementById("navigation");

var wrapperWidth = document.getElementsByTagName("main")[0].clientWidth;
var wrapperHeight = document.getElementsByTagName("main")[0].clientHeight;


var timetableDebug = {} // debug
function parseFile() {
    var file = this.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            let timetable = plist.parse(evt.target.result);
            timetableDebug = timetable;
            drawTimetable(timetable);
        }
        reader.onerror = function (evt) {
            console.log("error reading file");
        }
    }
}

function toggleWeekView() {
    let allCanvas = document.getElementsByTagName("canvas");
    for (canva of [...allCanvas]) {
        canva.style.display = "none";
    }
    let canvas = document.getElementById(`week-${this.value}`);
    console.log(this.value)
    canvas.style.display = "unset";
}

function drawWeekSlider(numberOfWeeks) {
    let slider = document.createElement("input");
    slider.setAttribute("id", "slider");
    slider.setAttribute("type", "range");
    slider.setAttribute("list", "tickmarks");
    slider.setAttribute("step", "1");
    slider.setAttribute("min", "0");
    slider.setAttribute("value", "0");
    slider.setAttribute("max", numberOfWeeks - 1);
    slider.addEventListener("change", toggleWeekView, false);
    let datalist = document.createElement("datalist");
    datalist.setAttribute("id", "tickmarks");
    datalist.style.display = "flex";
    datalist.style.justifyContent = "space-between"
    navigationHTML.appendChild(slider);
    navigationHTML.appendChild(datalist);
    for (let i = 0; i < numberOfWeeks; i++) {
        let week = document.createElement("option");
        week.setAttribute("value", i);
        week.setAttribute("label", `Week ${i+1}`)
        datalist.appendChild(week);

        let canvas = document.createElement("canvas");
        canvas.setAttribute("width", wrapperWidth);
        canvas.setAttribute("height", wrapperHeight - 400);
        canvas.setAttribute("id", `week-${i}`);
        if (i != 0) {
            canvas.style.display = "none";
        }
        timetableHTML.appendChild(canvas);
    }
}

function drawDays(colors, events) {
    let earliestEvent = events.reduce(function (prev, curr) {
        return prev.time < curr.time ? prev : curr;
    }).time;

    let blockWidth = wrapperWidth / 7 - 10;
    let margin = 20;

    for (period of events) {
        var canvas = document.getElementById(`week-${period.weekNum}`);
        if (canvas.getContext) {
            let ctx = canvas.getContext('2d');
            let [r, g, b] = colors[period.title].map(x => x * 255);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;

            [x, y, w, h] = [
                period.dayNum * blockWidth + 5,
                Math.ceil((period.time - earliestEvent) / 60) + 5,
                blockWidth - 15,
                Math.ceil((period.endTime - period.time) / 60)
            ]
            ctx.fillRect(x, y, w, h);

            ctx.lineCap = "round";
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y);
            ctx.moveTo(x + w, y);
            ctx.lineTo(x + w, y + h);
            ctx.moveTo(x + w, y + h);
            ctx.lineTo(x, y + h);
            ctx.moveTo(x, y + h);
            ctx.lineTo(x, y);
            ctx.stroke();

            ctx.font = '12px Segoe UI'
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillText(period.title, x + margin, y + 2 * margin);
            if (period.info) {
                ctx.fillText(period.info, x + margin, y + 3 * margin);
            }
        }
    }

}

function drawTimetable(timetable) {
    console.log(timetable)
    drawWeekSlider(timetable.Settings.NumberOfWeeks);
    drawDays(timetable.Settings.ColorSettings, timetable.WeekEvents);
}

document.getElementById("uploadInput").addEventListener("change", parseFile, false);