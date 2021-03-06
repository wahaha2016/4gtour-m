import Vue from 'vue'
import moment from 'moment'
import router from '../../router'
import * as mutationTypes from '../mutation-types'
import { DATA_FETCH_TEXT, DATA_SAVE_TEXT } from '../loading-texts'
import { SUB_ENTITY_SOCKET_NAME } from '../keys'
import { APICLOUD_OTHER_ANNOTATION } from '../share-apicloud-event-names'
import io from 'socket.io-client'
import { groupSocketUrl } from '../../config/socket-option'
const ENTITY_NAME = 'GROUP'
export const LATEST_NAME = '$LATEST'
export const CONVENING_NAME = '$CONVENING'
export const CONVENING_LOCATION_NAME = '$CONVENING_LOCATION'

const initGroupInfo = {
  leader: {},
  assembling_place: {},
  participants: [],
  checkins: [],
  leave_outs: []
}
// initial state
const state = {
  latest: Object.assign({}, initGroupInfo),
  conveningOne: Object.assign({}, initGroupInfo),
  conveningLocation: {
    lon: '',
    lat: ''
  },
  all: [],
  current: Object.assign({}, initGroupInfo),
  groupsFirstLoaded: false,
  listRequestTypeAppending: true,
  noMoreOfIndexes: false,
  newGroup: true,
  socket: {}
}

// getters
const getters = {
  allGroups (state) {
    return state.all
  },
  latestParticipated (state) {
    return state.latest
  },
  conveningGroup (state) {
    return state.conveningOne
  },
  groupInDetails (state) {
    return state.current
  },
  appendGroupDiabled (state, rootState) {
    return rootState.loading || state.noMoreOfIndexes || !state.groupsFirstLoaded
  },
  showGroupFetchIndicator (state, rootState) {
    return rootState.loading && !state.listRequestTypeAppending
  },
  showGroupAppendIndicator (state, rootState) {
    return rootState.loading && state.listRequestTypeAppending
  },
  haveNewGroup (state) {
    return state.newGroup
  }
}

// mutations
const mutations = {
  [ENTITY_NAME + SUB_ENTITY_SOCKET_NAME + mutationTypes.SET] (state) {
    // 设置socket
    if (groupSocketUrl.toLowerCase().startsWith('https')) {
      state.socket = io(groupSocketUrl, {secure: true})
    } else {
      state.socket = io(groupSocketUrl)
    }

    state.socket.on('connect', () => {
      console.log('group socket connected')
    })
    state.socket.on('disconnect', () => {
      console.log('group socket disconnected')
    })
  },
  [ENTITY_NAME + mutationTypes.SET_LIST_REQUEST_TYPE] (state, { listRequestType }) {
    state.listRequestTypeAppending = listRequestType === 'append'
  },
  [ENTITY_NAME + mutationTypes.FETCH_LIST_SUCCESS] (state, { groups }) {
    state.all = groups
    state.groupsFirstLoaded = true
    state.newGroup = false
  },
  [ENTITY_NAME + mutationTypes.APPEND_LIST_SUCCESS] (state, { groups }) {
    state.all = state.all.concat(groups)
  },
  [ENTITY_NAME + mutationTypes.SET_NO_MORE] (state, { fetchCount, size }) {
    state.noMoreOfIndexes = fetchCount < size
  },
  [ENTITY_NAME + LATEST_NAME + mutationTypes.SET] (state, { latest }) {
    state.latest = latest
  },
  [ENTITY_NAME + CONVENING_NAME + mutationTypes.SET] (state, { conveningOne }) {
    state.conveningOne = conveningOne
  },
  [ENTITY_NAME + CONVENING_NAME + mutationTypes.LEAVE_OUT] (state, { memberId }) {
    state.conveningOne = Object.assign({}, initGroupInfo)
    let newLatestIndex = state.all.findIndex(item => item.participanter_ids.some((o) => {
      return o === memberId
    }))
    if (newLatestIndex !== -1) {
      state.latest = state.all.splice(newLatestIndex, 1)[0]
    } else {
      state.latest = Object.assign({}, initGroupInfo)
    }
  },
  [ENTITY_NAME + CONVENING_LOCATION_NAME + mutationTypes.SET] (state, { lon, lat }) {
    Vue.set(state.conveningLocation, 'lon', lon)
    Vue.set(state.conveningLocation, 'lat', lat)
  },
  [ENTITY_NAME + mutationTypes.FETCH_DETAILS_SUCCESS] (state, { group }) {
    state.current = group
  },
  [ENTITY_NAME + mutationTypes.HAVE_NEW_NOTIFY] (state) {
    state.newGroup = true
  },
  [ENTITY_NAME + mutationTypes.ADD] (state, { group }) {
    // 因为列表会刷新所以不用处理
    if (state.latest.id) {
      if (moment(group.assembling_time).unix() - moment(state.latest.assembling_time).unix() < 0) {
        state.latest = group
      }
    } else {
      state.latest = group
    }
  },
  [ENTITY_NAME + mutationTypes.DO] (state, { id, group }) {
    let theIndex = state.all.findIndex(item => item.id === id)
    if (theIndex !== -1) {
      // 如果在列表中，则必不在latest里
      if (state.latest.id) {
        console.log('DO:' + (moment(group.assembling_time).unix() - moment(state.latest.assembling_time).unix()))
        if (moment(group.assembling_time).unix() - moment(state.latest.assembling_time).unix() < 0) {
          state.all.splice(theIndex, 1, Object.assign({}, state.latest))
          state.latest = group
        } else {
          state.all.splice(theIndex, 1, group)
        }
      } else {
        state.all.splice(theIndex, 1)
        state.latest = group
      }
    } else if (state.latest.id === id) {
      // 如果在latest中
      state.latest = group
    }
    if (state.current.id === id) {
      state.current = Object.assign({}, group)
    }
  },
  [ENTITY_NAME + mutationTypes.UNDO] (state, { id, group, memberId }) {
    let theIndex = state.all.findIndex(item => item.id === id)
    if (theIndex !== -1) {
      // 如果在列表中，则必不在latest里
      state.all.splice(theIndex, 1, group)
    } else if (state.latest.id === id) {
      // 如果在latest中,更新当前的latest，并将latest加入到latest中，并从列表中查找自己参加的最近时间的group设为latest
      state.latest = group
      let newLatestIndex = state.all.findIndex(item => item.participanter_ids.some((o) => {
        return o === memberId
      }))

      if (newLatestIndex !== -1) {
        state.latest = state.all.splice(newLatestIndex, 1, group)[0]
      }
    }
    if (state.current.id === id) {
      state.current = Object.assign({}, group)
    }
  },
  [ENTITY_NAME + mutationTypes.CHANGE_STATUS] (state, { id, group }) {
    let theIndex = state.all.findIndex(item => item.id === id)
    if (theIndex !== -1) {
      // 如果在列表中，则必不在latest里
      state.all.splice(theIndex, 1, group)
    } else if (state.latest.id === id) {
      // 如果在latest中
      state.latest = group
    }
    if (state.current.id === id) {
      state.current = Object.assign({}, group)
    }
  },
  [ENTITY_NAME + mutationTypes.REMOVE] (state, { id }) {
    let theIndex = state.all.findIndex(item => item.id === id)
    if (theIndex !== -1) {
      state.all.splice(theIndex, 1)
    }
  }
}

// actions
const actions = {
  shakeHandToGroupSocket ({ commit, state, rootState, dispatch }) {
    commit(ENTITY_NAME + SUB_ENTITY_SOCKET_NAME + mutationTypes.SET)
    state.socket.on('SG001', (data) => {
      console.log('group socket listener SG001: ' + data.reason)
      // window.alert('group socket listener SG001: ' + data.reason)
      commit(ENTITY_NAME + mutationTypes.DO, {id: data.group.id, group: data.group})
    })
    state.socket.on('SG002', (data) => {
      console.log('group socket listener SG002: ' + data.reason)
      // window.alert('group socket listener SG002: ' + data.reason)
      commit(ENTITY_NAME + mutationTypes.UNDO, {id: data.group.id, group: data.group})
    })
    state.socket.on('SG003', (data) => {
      console.log('group socket listener SG003: ' + data.reason)
      if (state.latest.id === data.group.id) {
        commit(ENTITY_NAME + LATEST_NAME + mutationTypes.SET, {latest: {}})
      } else {
        commit(ENTITY_NAME + mutationTypes.REMOVE, data.group)
      }
      let arrParticipated = state.all.filter((o) => {
        return o.participanter_ids.some((p) => {
          return p === rootState.member.self.member_id
        })
      })
      if (arrParticipated.length > 0) {
        let latestParticipated = arrParticipated[0]
        commit(ENTITY_NAME + mutationTypes.REMOVE, latestParticipated)
        commit(ENTITY_NAME + LATEST_NAME + mutationTypes.SET, {latest: latestParticipated})
      }
    })
    state.socket.on('SG004', (data) => {
      console.log('group socket listener SG004: ' + data.reason)
      commit(ENTITY_NAME + mutationTypes.CHANGE_STATUS, {id: data.group.id, group: data.group})
    })
    state.socket.on('SG100', (data) => {
      console.log('group socket listener SG100: ' + data.reason)
      data.group && commit(ENTITY_NAME + CONVENING_NAME + mutationTypes.SET, {conveningOne: data.group})
      data.checking_member && dispatch('toastInfo', data.checking_member.member_name + '签到成功')
    })
    state.socket.on('SG101', (data) => {
      console.log('group socket listener SG101: ' + data.reason)
      data.group && commit(ENTITY_NAME + CONVENING_NAME + mutationTypes.SET, {conveningOne: data.group})
      data.leaving_member && dispatch('toastInfo', data.leaving_member.member_name + '已退团')
    })
    state.socket.on('SG102', (data) => {
      console.log('group socket listener SG102: ' + data.reason)
      const groupName = state.conveningOne.name
      commit(ENTITY_NAME + CONVENING_NAME + mutationTypes.LEAVE_OUT, {member_id: rootState.member.self.member_id})
      dispatch('toastInfo', groupName + '已解散')
      if (rootState.route.path.startsWith('/group/convene/') || rootState.route.path === '/group/convening-member') {
        router.push({ path: '/group/index' })
      }
    })
    state.socket.on('SG103', (data) => {
      console.log('group socket listener SG103: ' + data.reason)
      // window.alert(data.location.lon + '   ' + data.location.lat)
      let type = data.isGroupLeader ? 'L' : 'M'
      dispatch('sendEventToApiCloud', { eventName: APICLOUD_OTHER_ANNOTATION, eventData: {id: data.locating_member.member_id, lon: data.location.lon, lat: data.location.lat, type} })
    })
    state.socket.emit('CG001', rootState.member.self.member_id)
    return Promise.resolve(state.socket)
  },
  ensureGroupSocket ({ state, rootState, dispatch }) {
    if (!state.socket.id) {
      return rootState.authMemberByTokenPromise.then(() => {
        return dispatch('shakeHandToGroupSocket')
      })
    }
    return dispatch('noop')
  },
  fetchGroups ({ commit, rootState }) {
    console.log('fetchGroups')
    commit(ENTITY_NAME + mutationTypes.SET_LIST_REQUEST_TYPE, { listRequestType: 'fetch' })
    return Vue.http.post('trv/groups', {latestParticipated: state.latest.id, page: {size: rootState.dataFetchingSizeSmall, skip: 0}}, {headers: {loadingText: DATA_FETCH_TEXT}}).then(ret => {
      if (ret.data.success) {
        const groups = ret.data.rows
        commit(ENTITY_NAME + mutationTypes.FETCH_LIST_SUCCESS, { groups })
        commit(ENTITY_NAME + mutationTypes.SET_NO_MORE, { fetchCount: groups.length, size: rootState.dataFetchingSizeSmall })
      } else {
        commit(ENTITY_NAME + mutationTypes.SET_NO_MORE, { fetchCount: 0, size: 1 })
      }
    })
  },
  appendGroups ({ commit, state, rootState }) {
    console.log('appendGroups')
    commit(ENTITY_NAME + mutationTypes.SET_LIST_REQUEST_TYPE, { listRequestType: 'append' })
    return Vue.http.post('trv/groups', {latestParticipated: state.latest.id, page: {size: rootState.dataFetchingSizeSmall, skip: state.all.length}}, {headers: {loadingText: DATA_FETCH_TEXT}}).then(ret => {
      if (ret.data.success) {
        const groups = ret.data.rows
        groups.length > 0 && commit(ENTITY_NAME + mutationTypes.APPEND_LIST_SUCCESS, { groups })
        commit(ENTITY_NAME + mutationTypes.SET_NO_MORE, { fetchCount: groups.length, size: rootState.dataFetchingSizeSmall })
      } else {
        commit(ENTITY_NAME + mutationTypes.SET_NO_MORE, { fetchCount: 0, size: 1 })
      }
    })
  },
  fetchLatestParticipated ({commit, dispatch}) {
    return Vue.http.get('trv/latestGroupParticipated', {headers: {loadingText: DATA_FETCH_TEXT}}).then(ret => {
      let latest
      if (ret.data.success) {
        latest = ret.data.ret
        latest && commit(ENTITY_NAME + LATEST_NAME + mutationTypes.SET, {latest})
      } else {
        dispatch('toastError', ret.data)
      }
      return latest
    })
  },
  ensureLatestParticipated ({ state, dispatch }) {
    if (!state.latest.id) {
      return dispatch('fetchLatestParticipated')
    }
    return dispatch('noop')
  },
  fetchConveningGroup ({commit, dispatch}, {id}) {
    return Vue.http.get('trv/group/' + id, {headers: {loadingText: DATA_FETCH_TEXT}}).then(ret => {
      let conveningOne
      if (ret.data.success) {
        conveningOne = ret.data.ret
        commit(ENTITY_NAME + CONVENING_NAME + mutationTypes.SET, {conveningOne})
      } else {
        dispatch('toastError', ret.data)
      }
      return conveningOne
    })
  },
  ensureConveningGroup ({ state, rootState, dispatch }) {
    if (!state.conveningOne.id) {
      return dispatch('fetchConveningGroup', rootState.route.params)
    }
    return dispatch('noop')
  },
  fetchGroupInfo ({commit, dispatch}, {id}) {
    return Vue.http.get('trv/group/' + id, {headers: {loadingText: DATA_FETCH_TEXT}}).then(ret => {
      let group
      if (ret.data.success) {
        group = ret.data.ret
        commit(ENTITY_NAME + mutationTypes.FETCH_DETAILS_SUCCESS, {group})
      } else {
        dispatch('toastError', ret.data)
      }
      return group
    })
  },
  ensureGroup ({ state, rootState, dispatch }) {
    if (!state.current.id || state.current.id !== rootState.route.params.id) {
      return dispatch('fetchGroupInfo', rootState.route.params)
    }
    return dispatch('noop')
  },
  saveGroup ({rootState, commit, state, dispatch}, theGroup) {
    if (!theGroup.id) {
      return Vue.http.post('trv/group', theGroup, {headers: {loadingText: DATA_SAVE_TEXT}}).then(ret => {
        const success = ret.data.success
        if (success) {
          const group = ret.data.ret
          commit(ENTITY_NAME + mutationTypes.FETCH_DETAILS_SUCCESS, {group})
          commit(ENTITY_NAME + mutationTypes.HAVE_NEW_NOTIFY)
          if (rootState.member_id === group.member_id) {
            // 更新自己发布的
            commit(ENTITY_NAME + mutationTypes.ADD, {group})
          }
          state.socket.emit('CG002', group.id)
          dispatch('submitFormSuccess').then(() => {
            dispatch('toastSuccess')
          })
        } else {
          dispatch('submitFormFail').then(() => {
            dispatch('toastError', ret.data)
          })
        }
        return success
      })
    } else {
      return Vue.http.put('trv/group/' + theGroup.id, theGroup, {headers: {loadingText: DATA_SAVE_TEXT}}).then(ret => {
        const success = ret.data.success
        if (success) {
          const group = ret.data.ret
          commit(ENTITY_NAME + mutationTypes.FETCH_DETAILS_SUCCESS, {group})
          dispatch('submitFormSuccess').then(() => {
            dispatch('toastSuccess')
          })
        } else {
          dispatch('submitFormFail').then(() => {
            dispatch('toastError', ret.data)
          })
        }
        return success
      })
    }
  },
  updateLatestGroupStatus ({state, rootState, commit, dispatch}, {id, group_status}) {
    return Vue.http.put('trv/group/' + id, {group_status}, {headers: {loadingText: DATA_SAVE_TEXT}}).then(ret => {
      const success = ret.data.success
      if (success) {
        const latest = ret.data.ret
        if (latest) {
          if (latest.group_status === 'A0007') {
            // 如果新设置的latest的group_status是A0007(不成团关闭)，则需要从state.all中提取最新的数据到latest中
            // todo: 将来需要从服务端去检测，当前仅从在线列表中检测
            let arrParticipated = state.all.filter((o) => {
              return o.participanter_ids.some((p) => {
                return p === rootState.member.self.member_id
              })
            })
            if (arrParticipated.length > 0) {
              let latestParticipated = arrParticipated[0]
              commit(ENTITY_NAME + mutationTypes.REMOVE, latestParticipated)
              commit(ENTITY_NAME + LATEST_NAME + mutationTypes.SET, {latest: latestParticipated})
            } else {
              // 列表中没有任何参加的团
              commit(ENTITY_NAME + LATEST_NAME + mutationTypes.SET, {latest: {}})
            }
          } else {
            commit(ENTITY_NAME + LATEST_NAME + mutationTypes.SET, {latest})
          }
        }
        dispatch('toastSuccess')
      } else {
        dispatch('toastError', ret.data)
      }
      return success
    })
  },
  participateGroup ({commit, dispatch}, {id}) {
    return Vue.http.post('trv/groupParticipate/' + id, {}, {headers: {loadingText: DATA_SAVE_TEXT}}).then(ret => {
      const success = ret.data.success
      if (success) {
        const group = ret.data.ret
        id === state.current.id && commit(ENTITY_NAME + mutationTypes.FETCH_DETAILS_SUCCESS, {group})
        commit(ENTITY_NAME + mutationTypes.DO, {id, group})
        state.socket.emit('CG003', id)
        dispatch('toastSuccess')
      } else {
        dispatch('toastError', ret.data)
      }
      return success
    })
  },
  exitGroup ({state, commit, dispatch}, {id}) {
    return Vue.http.post('trv/groupExit/' + id, {}, {headers: {loadingText: DATA_SAVE_TEXT}}).then(ret => {
      const success = ret.data.success
      if (success) {
        const group = ret.data.ret
        id === state.current.id && commit(ENTITY_NAME + mutationTypes.FETCH_DETAILS_SUCCESS, {group})
        commit(ENTITY_NAME + mutationTypes.UNDO, {id, group})
        state.socket.emit('CG004', id)
        dispatch('toastSuccess')
      } else {
        dispatch('toastError', ret.data)
      }
      return success
    })
  },
  checkInConveningGroup ({state, rootState, commit, dispatch}) {
    return Vue.http.post('trv/groupCheckIn/' + state.conveningOne.id, {}, {headers: {loadingText: DATA_SAVE_TEXT}}).then(ret => {
      const success = ret.data.success
      if (success) {
        const group = ret.data.ret
        commit(ENTITY_NAME + CONVENING_NAME + mutationTypes.SET, {conveningOne: group})
        state.socket.emit('CG100', { group_id: group.id, checking_member: rootState.member.self })
        dispatch('toastSuccess')
      } else {
        dispatch('toastError', ret.data)
      }
      return success
    })
  },
  leaveOutConveningGroup ({state, rootState, commit, dispatch}, {isGroupLeader}) {
    return Vue.http.post('trv/groupLeaveOut/' + state.conveningOne.id, {}, {headers: {loadingText: DATA_SAVE_TEXT}}).then(ret => {
      const success = ret.data.success
      if (success) {
        console.log('isGroupLeader:' + isGroupLeader)
        const group = ret.data.ret
        commit(ENTITY_NAME + CONVENING_NAME + mutationTypes.LEAVE_OUT, {member_id: rootState.member.self.member_id})
        if (isGroupLeader) {
          state.socket.emit('CG102', { group_id: group.id })
        } else {
          state.socket.emit('CG101', { group_id: group.id, leaving_member: rootState.member.self })
        }
        dispatch('toastSuccess')
      } else {
        dispatch('toastError', ret.data)
      }
      return success
    })
  },
  reportLocationAsGroupMember ({state, rootState, commit, dispatch}, {id, lon, lat}) {
    commit(ENTITY_NAME + CONVENING_LOCATION_NAME + mutationTypes.SET, {lon, lat})
    state.socket.emit('CG103', {group_id: id, locating_member: rootState.member.self, location: state.conveningLocation})
    return dispatch('noop')
  },
  checkGroupMemberPosition ({rootState}, {group}) {
    if (!group) return ''
    let groupMembers = group.participants.filter((o) => {
      return o.participant_id === rootState.member.self.member_id
    })
    if (groupMembers.length !== 1) {
      return ''
    }
    let groupMember = groupMembers[0]
    return groupMember.position_in_group
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
