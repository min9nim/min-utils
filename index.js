const R = require('ramda');

exports.OR = (pred1, pred2) => {
  return (value) => R.or(pred1(value), pred2(value))
}

exports.AND = (pred1, pred2) => {
  return (value) => R.and(pred1(value), pred2(value))
}

exports.exclude = R.pipe(
  R.complement,
  R.filter,
)

exports.isNotNil = R.complement(R.isNil)

exports.highlight = (word, HIGHLIGHT_DELIMETER = ' ') => {
  return (str) => {
    if(!word){
      return str
    }
    const regStr = word
      .split(HIGHLIGHT_DELIMETER)
      .filter((word) => word !== '')
      .join('|')
    const reg = new RegExp(`(${regStr})`, 'gi')
    return str.replace(reg, '<mark>$1</mark>')
  }
}

exports.removeTag = (html) => {
  if(html === undefined){
    return ''
  }
  return html.replace(/(<([^>]+)>)/gi, '')
}

exports.peek = (...args) => {
  return (value) => {
    // console.log('peek called')
    console.log(...args, value) // eslint-disable-line
    return value
  }
}

exports.go = (...args) => {
  // @ts-ignore
  return R.pipe(...args.slice(1))(args[0])
}

exports.constant = (value) => {
  return () => value
}

exports.noop = () => {}

exports.indexMap = (...args) => {
  if(args.length === 1){
    return (list) => {
      Array.prototype.map.call(list, args[0])
    }
  }
  return Array.prototype.map.call(args[1], args[0])
}

exports.idEqual = R.propEq('_id')

exports.findById = R.pipe(
  exports.idEqual,
  R.find,
)

exports.updateBy = R.curry((pred, tobe) => {
  return (list) => {
    const index = R.findIndex(pred)(list)
    return R.update(index, tobe)(list)
  }
})

exports.removeBy = (pred) => {
  return (list) => {
    const index = R.findIndex(pred)(list)
    return R.remove(index, 1)(list)
  }
}

exports.updateById = R.curry((id, tobe, list) => {
  return R.updateBy(exports.idEqual(id))(tobe)(list)
})

exports.removeById = R.curry((id, list) => {
  return exports.removeBy(exports.idEqual(id))(list)
})

/*
 * 패러미터 문자열 중 아래와 같이 매칭되는 문자열을 변환
 * [제목](링크) => <a href="링크">제목</a>
 * */
exports.addLink = R.replace(/\[(.+)\]\(([^()]+)\)/g)('<a href="$2">$1</a>')

exports.flatLog = (...args) => {
  const serialized = args.map((arg) => {
    if(typeof arg === 'object'){
      return JSON.stringify(arg, null, 2)
    }else if(typeof arg === 'function'){
      return arg.toString()
    }
    return arg
  })
  // eslint-disable-next-line
  console.log(...serialized)
}

exports.forceFileDownload = (blob, name) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', name)
  link.click()
}

exports.download = async ({uri, name}) => {
  const response = await fetch(uri)
  const blob = await response.blob()
  exports.forceFileDownload(blob, name)
}

exports.getHostname = (url) => {
  let start = url.indexOf('://') + 3
  let end = url.indexOf('/', start)
  return url.slice(start, end)
}

exports.getProtocol = (url) => {
  let end = url.indexOf('://') + 3
  return url.slice(0, end)
}

exports.appendQueryParams = (paramObj) => {
  return assignQueryParams(location.href)(paramObj)
}

exports.copyToClipboard = (val) => {
  let t = document.createElement('textarea')
  document.body.appendChild(t)
  t.value = val
  t.select()
  document.execCommand('copy')
  document.body.removeChild(t)
}

exports.blinkDomElement = (dom) => {
  const BORDER_STYLE = '1px solid red'
  const INTERVAL = 500
  const TIMEOUT = 3000
  if(!dom){
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
