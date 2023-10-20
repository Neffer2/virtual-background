import {effectsList} from "./effectsConfig.js";
import {importedEffectsList} from "./import/effectsList.js";
import {
  applyEffect,
  applyEffectParam,
  clearEffect,
  getScreenshot,
  startAnalysis,
  startGame,
  startPlayer,
  stopAnalysis,
} from "./BanubaPlayer.js"

const webcamSourceButton = document.querySelector('#webcam')
const effectsBlock = document.querySelector('.effects-list')
const effectControlBlock = document.querySelector('.effect-control')
const handGesturesBlock = document.querySelector('.hand-gestures')
const heartRateBlock = document.querySelector('.heart-rate')
const testRulerBlock = document.querySelector('.test-ruler')

let menuScene = document.getElementById('menu-scene')
let webcamScene = document.getElementById('webcam-scene')

let selectedCategoryInput
let selectedEffect

let controlBlock
let controlFunc
let curEventType


const setEffectParam = async (params, value, arg) => {
  for (const param of params) {
    const s = arg ? `${param}({${arg}:${value}})` : `${param}(${value})`
    await applyEffectParam(s)
  }
}

const removeEffectControlHandler = () => {
  effectControlBlock.innerHTML = ''

  if (curEventType === 'analise') {
    stopAnalysis()
    handGesturesBlock.classList.add('hidden')
    heartRateBlock.classList.add('hidden')
    testRulerBlock.classList.add('hidden')
  } else if (curEventType) {
    controlBlock.removeEventListener(curEventType, controlFunc)
  }
}


const addEffectControlHandler = (control) => {

  curEventType = control

  switch (control) {

    case 'slider':
      const min = selectedEffect.minValue !== undefined ? selectedEffect.minValue : -10
      effectControlBlock.innerHTML = `
        <div class="effect-control__slider-container">
          <input type="range" min="${min}" max="10" value="0" class="effect-control__slider">
        </div>`
      controlBlock = document.querySelector('.effect-control__slider')
      const value = (0 - min) / (10 - min) * 100
      controlBlock.style.background = 'linear-gradient(to right, #4794FE 0%, #4794FE ' + value + '%, #EEF2F7 ' + value + '%, #EEF2F7 100%)'
      controlFunc = async (e) => {
        const value = (e.target.value - e.target.min) / (e.target.max - e.target.min) * 100
        document.querySelector('.effect-control__slider').style.background = 'linear-gradient(to right, #4794FE 0%, #4794FE ' + value + '%, #EEF2F7 ' + value + '%, #EEF2F7 100%)'
        await setEffectParam(selectedEffect.params, e.target.value * selectedEffect.direction / 10, selectedEffect?.arg)
      }
      controlBlock.addEventListener('input', controlFunc)
      break

    case 'toggle':
      effectControlBlock.innerHTML = '<input type="checkbox" name="toggle" class="effect-control__toggle" checked>'
      controlBlock = document.querySelector('.effect-control__toggle')
      controlFunc = async (e) => {
        await setEffectParam(selectedEffect.params, e.target.checked ? 1 : 0)
      }
      controlBlock.addEventListener('change', controlFunc)
      break

    case 'analise':
      if (selectedEffect.name === 'Detection_gestures.zip') {
        // handGesturesTipBlock.classList.remove('hidden')
        controlBlock = handGesturesBlock
      } else if (selectedEffect.name === 'heart_rate.zip') {
        heartRateBlock.classList.remove('hidden')
        controlBlock = heartRateBlock
      } else if (selectedEffect.name === 'test_Ruler.zip') {
        testRulerBlock.classList.remove('hidden')
        controlBlock = testRulerBlock
      }
      controlFunc = startAnalysis(selectedEffect.name, selectedEffect.params[0], controlBlock)
      break

    case 'game':
      controlFunc = startGame
      controlBlock = document.querySelector('#webar')
      controlBlock.addEventListener('click', controlFunc)
      break

    default:
      controlBlock = null
      controlFunc = null
      curEventType = null
  }

}


const startEffect = () => {
  selectedEffect = 'Background_change.zip'
  const effectPath = 'assets/effects/'
  applyEffect(effectPath + selectedEffect)
    .then(() => addEffectControlHandler(selectedEffect?.control))
}

const createEffectBlock = async (effects) => {
  let htmlBlock = ''
  const onEffectSelect = async (e) => {
    removeEffectControlHandler()
    await clearEffect()
    startEffect(e?.target.value ?? 0)
  }

  if (effects.length > 1) {

    for (let i in effects) {
      htmlBlock += `
        <div class="effect">
          <label>
            <input type="radio" name="effect" id="${i}" value="${i}">
              <div class="effect-icon__border">
                <img class="effect-icon" src="assets/icons/effects/${effects[i].icon}" alt="${effects[i].name}">
              </div>
          </label>
        </div>`
    }

    effectsBlock.innerHTML = htmlBlock
    effectsBlock.style.marginLeft = selectedCategoryInput.value === 'facemorphing' ? '-60px' : null

    document.querySelectorAll('input[name="effect"]').forEach((el, i) => {
      el.addEventListener('click', onEffectSelect)
      if (i === 0) el.click();
    })
  } else {
    effectsBlock.innerHTML = htmlBlock
    await onEffectSelect()
  }
}


const onWebcamSelect = (e) => {
  startPlayer()
  startEffect()

  webcamScene.setAttribute("class", "webcam-scene")
  menuScene.setAttribute("class", "hidden")
};

enablePlay()

// ME ejecuto cuando todo acaba de cargar;
function enablePlay (){
  webcamSourceButton.style.opacity = "1";
  webcamSourceButton.style.pointerEvents = "all";
}

webcamSourceButton.addEventListener('click', onWebcamSelect)