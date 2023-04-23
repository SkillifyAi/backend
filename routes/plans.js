const router = require('express').Router()
const utils = require('../controllers/utils')
const {getAll, getOnePlan, savePlan, updatePlan, deletePlan, planNumber, rememberDay, getDates, planCompleted} = require('../controllers/plans')

router.use(utils.getPayload)
router.get('/', getAll)

router.get('/:id', getOnePlan)

router.post('/', planNumber, savePlan)

router.patch('/:id', updatePlan)

router.delete('/:id', deletePlan)

router.post('/calendar/:id', rememberDay)

router.get('/calendar/:id', getDates)

router.get('/completed/:id', planCompleted)

module.exports = router