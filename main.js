window.onload = () => {}

var timetableHTML = document.getElementById("timetable");
var navigationHTML = document.getElementById("navigation");

var wrapperWidth = document.getElementsByTagName("main")[0].clientWidth - 100;
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
            document.getElementById("data").innerHTML = JSON.stringify(timetable, null, '  ');
            drawTimetable(timetable);
        }
    }
}

function toggleWeekView() {
    let allCanvas = document.getElementsByTagName("canvas");
    for (canva of [...allCanvas]) {
        canva.style.display = "none";
    }
    let canvas = document.getElementById(`week-${this.value}`);
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
    timetableHTML.prepend(slider);
    timetableHTML.prepend(datalist);
    for (let i = 0; i < numberOfWeeks; i++) {
        let week = document.createElement("option");
        week.setAttribute("value", i);
        week.setAttribute("label", `Week ${i+1}`)
        datalist.append(week);

        let canvas = document.createElement("canvas");
        canvas.setAttribute("width", wrapperWidth);
        canvas.setAttribute("height", wrapperHeight - 400);
        canvas.setAttribute("id", `week-${i}`);
        if (i != 0) {
            canvas.style.display = "none";
        }
        timetableHTML.append(canvas);
    }
}

function drawDays(colors, events) {
    let earliestEvent = events.reduce(function (prev, curr) {
        return prev.time < curr.time ? prev : curr;
    }).time;

    let blockWidth = wrapperWidth / 7 - 10;
    let margin = 16;

    var allCanvas = document.getElementsByTagName("canvas");
    for (i = 0; i < 7; i++) {
        for (canva of [...allCanvas]) {
            if (canva.getContext) {
                let ctx = canva.getContext('2d');
                ctx.font = '12px Segoe UI'
                ctx.fillText([
                    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                ][i], i * blockWidth + margin, 12);
            }
        }
    }

    for (period of events) {
        var canvas = document.getElementById(`week-${period.weekNum}`);
        if (canvas.getContext) {
            let ctx = canvas.getContext('2d');
            let [r, g, b] = colors[period.title].map(x => x * 255);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;

            [x, y, w, h] = [
                period.dayNum * blockWidth + 5,
                Math.ceil((period.time - earliestEvent) / 60) + 2 * margin,
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
            let startHour = Math.floor(period.time / (60 * 60));
            let startMinutes = Math.floor(period.time % (60 * 60) / 60);
            if (startMinutes == 0) {
                startMinutes = "00";
            }
            let endHour = Math.floor(period.endTime / (60 * 60));
            let endMinutes = Math.floor(period.endTime % (60 * 60) / 60);
            if (endMinutes == 0) {
                endMinutes = "00";
            }
            ctx.fillText(`${startHour}:${startMinutes} - ${endHour}:${endMinutes}`, x + margin, y + 3 * margin);
            if (period.info) {
                ctx.fillText(period.info, x + margin, y + 4 * margin);
            }
        }
    }

}

function drawTimetable(timetable) {
    drawWeekSlider(timetable.Settings.NumberOfWeeks);
    drawDays(timetable.Settings.ColorSettings, timetable.WeekEvents);
}

async function saveToFile() {
    let timetable = plist.parse(plist.build(JSON.parse(document.getElementById("data").innerHTML)));
    let link = document.createElement('a');
    link.download = 'timetable.timetable';
    let blob = new Blob([timetable], {
        type: 'text/plain'
    });
    link.href = window.URL.createObjectURL(blob);
    link.click();
}

function createNew() {
    let timetable = plist.parse(plist.build(emptyTimetable));
    Array.from(timetableHTML.childNodes).map(el => el.remove());
    document.getElementById("data").innerHTML = JSON.stringify(timetable, null, '  ');
    drawTimetable(timetable);
}


document.getElementById("uploadInput").addEventListener("change", parseFile, false);
document.getElementById("data").addEventListener("input", function () {
    let timetable = plist.parse(plist.build(JSON.parse(this.innerHTML)));
    Array.from(timetableHTML.childNodes).map(el => el.remove());
    drawTimetable(timetable);
}, false);