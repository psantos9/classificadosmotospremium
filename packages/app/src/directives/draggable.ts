import type { Directive, DirectiveBinding } from 'vue'

export interface IVDraggableBindingValue {
  dropzone?: boolean
}

export interface IDraggableBindingValue {
  img?: string
  /** Dragover attribute set on the dropzone, defaults to "data-dragover" */
  dragoverAttribute?: string
  /** Defaults to "v-draggable-data" */
  group?: string
  acceptGroups?: string[]
  data?: unknown
  draggingGroupCallback?: (params: { group: string, dragging: boolean }) => void | Promise<void>
  dropCallback?: (group: string, data: any) => void | Promise<void>
}

const getGroup = (binding: DirectiveBinding<IDraggableBindingValue>) =>
  binding.value?.group ?? 'v-draggable-data'

const dragstartHandler = (evt: DragEvent, binding: DirectiveBinding<IDraggableBindingValue>) => {
  if (!evt.dataTransfer) {
    return
  }
  const group = getGroup(binding)
  void binding.value.draggingGroupCallback?.({ group, dragging: true })
  if (typeof binding.value?.img === 'string') {
    const img = new Image()
    img.src = binding.value.img
    evt.dataTransfer.setDragImage(img, 10, 10)
  }
  if (binding.value.data !== undefined) {
    evt.dataTransfer.setData(group, JSON.stringify(binding.value.data))
  }
}

const dragendHandler = (evt: DragEvent, binding: DirectiveBinding<IDraggableBindingValue>) => {
  if (!evt.dataTransfer) {
    return
  }
  const group = binding.value?.group ?? 'v-draggable-data'
  void binding.value.draggingGroupCallback?.({ group, dragging: false })
}

const getRootDropzoneElement = (el: HTMLElement | null, acceptGroups: string[]) => {
  let target = el
  let dataDraggingActive: string = ''
  while (target !== null && !acceptGroups.includes(dataDraggingActive)) {
    dataDraggingActive = target?.getAttribute('data-dragging-active') ?? ''
    if (!acceptGroups.includes(dataDraggingActive)) {
      target = target?.parentElement ?? null
    }
  }
  return target
}

let counter = 0
let currentDropzoneElement: HTMLElement | null = null

const dragenterHandler = (evt: DragEvent, binding: DirectiveBinding<IDraggableBindingValue>) => {
  evt.preventDefault()
  counter++
  const group = getGroup(binding)
  const acceptGroups = binding.value.acceptGroups ?? [group]

  const dropzoneElement = getRootDropzoneElement(evt.target as HTMLElement, acceptGroups)

  if (counter === 1) {
    if (!dropzoneElement?.isSameNode(currentDropzoneElement)) {
      currentDropzoneElement?.removeAttribute(binding.value?.dragoverAttribute ?? 'data-dragover')
      currentDropzoneElement = dropzoneElement
    }
    dropzoneElement?.setAttribute(binding.value?.dragoverAttribute ?? 'data-dragover', 'true')
  }
}

const dragoverHandler = (evt: DragEvent) => {
  evt.preventDefault()
}

const dragleaveHandler = (evt: DragEvent, binding: DirectiveBinding<IDraggableBindingValue>) => {
  counter--
  if (counter === 0) {
    const group = getGroup(binding)
    const acceptGroups = binding.value.acceptGroups ?? [group]
    const dropzoneElement = getRootDropzoneElement(evt.target as HTMLElement, acceptGroups)
    dropzoneElement?.removeAttribute?.(binding.value?.dragoverAttribute ?? 'data-dragover')
    currentDropzoneElement?.removeAttribute(binding.value?.dragoverAttribute ?? 'data-dragover')
    currentDropzoneElement = null
  }
}

const dropHandler = (evt: DragEvent, binding: DirectiveBinding<IDraggableBindingValue>) => {
  evt.preventDefault()
  const group = getGroup(binding)
  const acceptGroups = binding.value.acceptGroups ?? [group]
  const dropzoneElement = getRootDropzoneElement(evt.target as HTMLElement, acceptGroups)
  const isLocked = (dropzoneElement?.getAttribute('data-locked') ?? null) === 'true'

  if (!isLocked) {
    const data = evt?.dataTransfer?.getData(group) ?? null
    if (typeof data === 'string' && data.length > 0) {
      void binding?.value?.dropCallback?.(group, JSON.parse(data))
    }
  }

  dropzoneElement?.removeAttribute?.(binding.value?.dragoverAttribute ?? 'data-dragover')
  currentDropzoneElement?.removeAttribute(binding.value?.dragoverAttribute ?? 'data-dragover')
  currentDropzoneElement = null
  counter = 0
}

const Draggable: Directive<HTMLElement, IDraggableBindingValue> = {
  mounted: (el, binding) => {
    el.setAttribute('draggable', 'true')
    el.addEventListener('dragstart', evt => dragstartHandler(evt, binding))
    el.addEventListener('dragend', evt => dragendHandler(evt, binding))

    if (typeof binding.value.dropCallback === 'function') {
      el.addEventListener('drop', evt => dropHandler(evt, binding))
      el.addEventListener('dragenter', evt => dragenterHandler(evt, binding))
      el.addEventListener('dragover', evt => dragoverHandler(evt))
      el.addEventListener('dragleave', evt => dragleaveHandler(evt, binding))
    }
  },
  beforeUnmount: (el, binding) => {
    el.removeAttribute('draggable')
    el.removeEventListener('dragstart', evt => dragstartHandler(evt, binding))
    el.removeEventListener('dragend', evt => dragendHandler(evt, binding))

    if (typeof binding.value.dropCallback === 'function') {
      el.removeEventListener('drop', evt => dropHandler(evt, binding))
      el.removeEventListener('dragenter', evt => dragenterHandler(evt, binding))
      el.removeEventListener('dragover', evt => dragoverHandler(evt))
      el.removeEventListener('dragleave', evt => dragleaveHandler(evt, binding))
    }
  }
}

export default Draggable
