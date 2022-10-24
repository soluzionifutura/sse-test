
const ul8081 = document.getElementById("ul8081")
const ul8082 = document.getElementById("ul8082")

const redisCheckbox = document.getElementById("redis-checkbox")

document.getElementById("ping8081").onclick = () => fetch(`http://localhost:8081/ping?redis=${redisCheckbox.checked}`).catch(console.error)
document.getElementById("ping8082").onclick = () => fetch(`http://localhost:8082/ping?redis=${redisCheckbox.checked}`).catch(console.error)

document.getElementById("kill8081").onclick = () => fetch("http://localhost:8081/kill").catch(console.error)
document.getElementById("kill8082").onclick = () => fetch("http://localhost:8082/kill").catch(console.error)

const li = (innerHtml, color = "black") => {
  const li = document.createElement("li")
  li.style.color = color
  li.innerHTML = innerHtml
  return li
}

void [[8081, ul8081], [8082, ul8082]].forEach(([port, ul]) => {
  const evtSource = new EventSource(`http://localhost:${port}/streaming`)
  evtSource.onmessage = event => {
    console.log(`message ${port}`, event)
    ul.appendChild(li(event.data))
  }

  evtSource.onerror = event => {
    console.log(`error ${port}`, event)
    ul.appendChild(li(event.type, "red"))
  }

  evtSource.onopen = event => {
    console.log(`open ${port}`, event)
    ul.appendChild(li(event.type, "blue"))
  }
})