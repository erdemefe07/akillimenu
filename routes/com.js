const express = require('express')
const router = express.Router()
const tokenVerify = require('../helpers/jwt').verify
const Organization = require('../db/Model/Organization/Organization.js')

// ! ------ POST------ POST ------ POST ------ POST ------ POST ------ POST------

router.get('/', tokenVerify, (req, res) => {
    Organization.findById(req.AuthData, 'comments')
        .then(data => {
            if (!data)
                return res.error('Yorum yok')
            res.json(data.comments)
        })
        .catch(err => res.error('', err))
})

router.post('/', (req, res) => {
    const { org, star, comment } = req.body
    if (!org || !star || star < 0 || star > 5 || typeof comment != 'string')
        return res.error('Bazı alanlar yanlış')

    Organization.findOneAndUpdate({ username: org }, { $push: { comments: { star, comment, user: req.headers["user-agent"] } } })
        .then(data => {
            if (!data) return res.error('')
            res.json({ ok: true })
        })
        .catch(err => {
            const errors = []
            Object.entries(err.errors).forEach(([key, value]) => errors.push(`${key}: ${value}`))
            res.error(errors)
        })
})

router.delete('/:id', tokenVerify, (req, res) => {
    Organization.findOneAndUpdate({ _id: req.AuthData, 'comments._id': req.params.id }, { $pull: { 'comments': { _id: req.params.id } } })
        .then(data => {
            if (!data)
                return res.error('Yorum Bulunamadı')
            res.json({ ok: true })
        })
        .catch(err => res.error('', err))
})


module.exports = router
