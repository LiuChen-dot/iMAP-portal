import request from '@/utils/request'

export function getstrains() {
    return request({
        url: '/statistics/strains',
        method: 'get',
    })
}

export function getEntityRelation() {
    return request({
        url: '/statistics/getEntityRelation',
        method: 'get',
    })
}

export function getProteinTypes() {
    return request({
        url: '/statistics/getProteinTypes',
        method: 'get',
    })
}

export function getRnaTypes() {
    return request({
        url: '/statistics/getRnaTypes',
        method: 'get',
    })
}

export function getTaxonomyTypes(type) {
    return request({
        url: '/statistics/getTaxonomyTypes?type='+type,
        method: 'get',
    })
}

export function getCellMorphology(type) {
    return request({
        url: '/statistics/getCellMorphology?type='+type,
        method: 'get',
    })
}

export function getCultureMedium() {
    return request({
        url: '/statistics/getCultureMedium',
        method: 'get',
    })
}

export function getPHGrowth() {
    return request({
        url: '/statistics/getPHGrowth',
        method: 'get',
    })
}

export function getPHOptimumh() {
    return request({
        url: '/statistics/getPHOptimumh',
        method: 'get',
    })
}

export function getTemperatureGrowth() {
    return request({
        url: '/statistics/getTemperatureGrowth',
        method: 'get',
    })
}

export function getTemperatureRange() {
    return request({
        url: '/statistics/getTemperatureRange',
        method: 'get',
    })
}

export function getTemperatureOptimum() {
    return request({
        url: '/statistics/getTemperatureOptimum',
        method: 'get',
    })
}

export function getOxygenTolerance() {
    return request({
        url: '/statistics/getOxygenTolerance',
        method: 'get',
    })
}

export function getSaltGrowth() {
    return request({
        url: '/statistics/getSaltGrowth',
        method: 'get',
    })
}

export function getSaltOptimum() {
    return request({
        url: '/statistics/getSaltOptimum',
        method: 'get',
    })
}

export function getMetaboliteUtilizationmPositive() {
    return request({
        url: '/statistics/getMetaboliteUtilizationmPositive',
        method: 'get',
    })
}

export function getMetaboliteUtilizationmNegative() {
    return request({
        url: '/statistics/getMetaboliteUtilizationmNegative',
        method: 'get',
    })
}

export function getMetaboliteProduction() {
    return request({
        url: '/statistics/getMetaboliteProduction',
        method: 'get',
    })
}

export function getEnzymesActivityPositive() {
    return request({
        url: '/statistics/getEnzymesActivityPositive',
        method: 'get',
    })
}

export function getEnzymesActivityNegative() {
    return request({
        url: '/statistics/getEnzymesActivityNegative',
        method: 'get',
    })
}

export function getAntibioticSensitive() {
    return request({
        url: '/statistics/getAntibioticSensitive',
        method: 'get',
    })
}

export function getAntibioticResistant() {
    return request({
        url: '/statistics/getAntibioticResistant',
        method: 'get',
    })
}

export function getCountries() {
    return request({
        url: '/statistics/getCountries',
        method: 'get',
    })
}

export function getGCContent() {
    return request({
        url: '/statistics/getGCContent',
        method: 'get',
    })
}

export function getPathogenicity() {
    return request({
        url: '/statistics/getPathogenicity',
        method: 'get',
    })
}

export function getRiskGroup() {
    return request({
        url: '/statistics/getRiskGroup',
        method: 'get',
    })
}

export function getFattyAcidProfiles() {
    return request({
        url: '/statistics/getFattyAcidProfiles',
        method: 'get',
    })
}

export function getVogesProskauerTest() {
    return request({
        url: '/statistics/getVogesProskauerTest',
        method: 'get',
    })
}

export function getMethylredTest() {
    return request({
        url: '/statistics/getMethylredTest',
        method: 'get',
    })
}

export function getIndoleTest() {
    return request({
        url: '/statistics/getIndoleTest',
        method: 'get',
    })
}














