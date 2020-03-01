import {
  or,
  and,
  filter,
  complement,
  isNil,
  pipe,
  propEq,
  find,
  curry,
  findIndex,
  update,
  remove,
  replace,
} from 'ramda'

export const OR = (pred1, pred2) => {
  return value => or(pred1(value), pred2(value))
}

export const AND = (pred1, pred2) => {
  return value => and(pred1(value), pred2(value))
}

export const exclude = pipe(
  complement,
  filter,
)

export const isNotNil = complement(isNil)

export const highlight = (word, HIGHLIGHT_DELIMETER = ' ') => {
  return str => {
    if (!word) {
      return str
    }
    const regStr = word
      .split(HIGHLIGHT_DELIMETER)
      .filter(word => word !== '')
      .join('|')
    const reg = new RegExp(`(${regStr})`, 'gi')
    return str.replace(reg, '<mark>$1</mark>')
  }
}

export const removeTag = html => {
  if (html === undefined) {
    return ''
  }
  return html.replace(/(<([^>]+)>)/gi, '')
}

export const peek = (...args) => {
  return value => {
    // console.log('peek called')
    console.log(...args, value) // eslint-disable-line
    return value
  }
}

export const go = (...args) => {
  // @ts-ignore
  return pipe(...args.slice(1))(args[0])
}

export const constant = value => {
  return () => value
}

export const noop = () => {}

export const indexMap = (...args) => {
  if (args.length === 1) {
    return list => {
      Array.prototype.map.call(list, args[0])
    }
  }
  return Array.prototype.map.call(args[1], args[0])
}

export const idEqual = propEq('_id')

export const findById = pipe(
  idEqual,
  find,
)

export const updateBy = curry((pred, tobe) => {
  return list => {
    const index = findIndex(pred)(list)
    return update(index, tobe)(list)
  }
})

export const removeBy = pred => {
  return list => {
    const index = findIndex(pred)(list)
    return remove(index, 1)(list)
  }
}

export const updateById = curry((id, tobe, list) => {
  return updateBy(idEqual(id))(tobe)(list)
})

export const removeById = curry((id, list) => {
  return removeBy(idEqual(id))(list)
})

/*
 * 패러미터 문자열 중 아래와 같이 매칭되는 문자열을 변환
 * [제목](링크) => <a href="링크">제목</a>
 * */
export const addLink = replace(/\[(.+)\]\(([^()]+)\)/g)('<a href="$2">$1</a>')

export const flatLog = (...args) => {
  const serialized = args.map(arg => {
    if (typeof arg === 'object') {
      return JSON.stringify(arg, null, 2)
    } else if (typeof arg === 'function') {
      return arg.toString()
    }
    return arg
  })
  // eslint-disable-next-line
  console.log(...serialized)
}

export const forceFileDownload = (blob, name) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', name)
  link.click()
}

export const download = async ({uri, name}) => {
  const response = await fetch(uri)
  const blob = await response.blob()
  forceFileDownload(blob, name)
}

export const getHostname = url => {
  let start = url.indexOf('://') + 3
  let end = url.indexOf('/', start)
  return url.slice(start, end)
}

export const getProtocol = url => {
  let end = url.indexOf('://') + 3
  return url.slice(0, end)
}

export const assignQueryParams = url => {
  return paramObj => {
    setQueryParams(Object.assign([], getQueryParams(url), paramObj))
  }
}

export const appendQueryParams = paramObj => {
  return assignQueryParams(location.href)(paramObj)
}

export const copyToClipboard = val => {
  let t = document.createElement('textarea')
  document.body.appendChild(t)
  t.value = val
  t.select()
  document.execCommand('copy')
  document.body.removeChild(t)
}

export const blinkDomElement = dom => {
  const BORDER_STYLE = '1px solid red'
  const INTERVAL = 500
  const TIMEOUT = 3000
  if (!dom) {
    console.warn('[blinkDomElement] Not found blink dom')
    return
  }
  dom.style.border = BORDER_STYLE
  const interval = setInterval(() => {
    // console.log('3초간 깜빡임', dom.style.border)
    dom.style.border = dom.style.border === BORDER_STYLE ? '' : BORDER_STYLE
  }, INTERVAL)
  setTimeout(() => {
    // console.log('깜빡임 끝')
    clearInterval(interval)
    dom.style.border = ''
  }, TIMEOUT)
}

export const timer = timeout => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

export const esModule = _module => {
  return _module.default || _module
}
export function removeExt(filename) {
  return filename.replace(/\.(\w*)$/, '')
}

export const getFileName = (path, ext = false) => {
  const getFileNameRegex = /[^\\/]+\.[^\\/]+$/
  const [file = null] = path.match(getFileNameRegex) || []
  const name = file || path
  return ext ? name : removeExt(name)
}

export const nl2br = str => {
  if (!str) {
    return ''
  }
  return str.replace(/\r\n|\n/g, '<br />')
}

export const createRandomString = (length = 5) => {
  let text = ''
  // noinspection SpellCheckingInspection
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  Array.from(Array(length)).forEach(() => {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  })
  return text
}

export const getQueryParams = url => {
  const params = {}
  const idx = url.indexOf('?') + 1
  const fromIdx = url.slice(idx)
  // @ts-ignore
  fromIdx.replace(/([^(?|#)=&]+)(=([^&]*))?/g, ($0, $1, $2, $3) => {
    params[$1] = $3
  })
  // console.log(params)
  return params
}

export const setQueryParams = paramObj => {
  const params = Object.entries(paramObj)
    .map(([key, value]) => {
      let valueStr = value
      if (Array.isArray(value)) {
        valueStr = value.join(',')
      }
      return key + '=' + valueStr
    })
    .join('&')
  // console.log(params)
  window.history.pushState({}, '', '?' + params)
}

export const delay = (fn, ms) => {
  return new Promise(resolve => {
    const timeout = setTimeout(() => {
      fn()
      resolve(timeout)
    }, ms)
  })
}

export const onlyNumber = event => {
  if (event.keyCode < 48 || event.keyCode > 57) {
    event.returnValue = false
  }
}

export const numberWithCommas = num => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const enableUrl = str => {
  if (!str) {
    return ''
  }
  const isUrl = /((?:http|https?|ftps?|sftp):\/\/(?:[a-z0-9-]+\.)+[a-z0-9]{2,4}\S*)/gi
  if (isUrl.test(str)) {
    return str.replace(isUrl, '<a href="$1">$1</a>')
  }
  const wwwStart = /(www\.(?:[a-z0-9-]+\.)+[a-z0-9]{2,4}\S*)/gi
  if (wwwStart.test(str)) {
    return str.replace(wwwStart, '<a href="http://$1">$1</a>')
  }
  return str
}

export const loadJs = src => {
  return new Promise(resolve => {
    const headTag = document.getElementsByTagName('head')[0]
    const newScript = document.createElement('script')
    newScript.type = 'text/javascript'
    newScript.onload = () => {
      resolve()
    }
    newScript.src = src
    headTag.appendChild(newScript)
  })
}

export const sortKeys = (obj: any, pred?: any) => {
  const keys = Object.keys(obj)
  const sorted = {}
  keys.sort(pred).forEach(key => {
    sorted[key] = obj[key]
  })
  return sorted
}
