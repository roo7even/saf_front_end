window.onload = function ()
{
    var app = new Vue({
        el: '#app',
        data: {
            // Filter option
            searchTerm: '',
            orderByValue: 'name',
            orderDirection: 'desc',
            hiddenMetricColumns: [],

            // External data
            sensors: [],
            sensorTypes: [],
            metrics: []
        },
        created: function ()
        {
            fetch('./input_data/sensors.json').then(response => response.json()).then(
                //data => this.sensors = _.filter(Object.values(data), o => o.name != '')
                data => this.sensors = Object.values(data)
            );
            fetch('./input_data/sensorTypes.json').then(response => response.json()).then(
                data => this.sensorTypes = data
            );
            fetch('./input_data/metrics.json').then(response => response.json()).then(
                data => this.metrics = data.data.items
            );
        },
        computed: {
            tableData()
            {
                let filteredSensors = this.sensors;
                let searchTerm = this.searchTerm;

                // Search filter
                if (searchTerm != '')
                {
                    let comboss = [];
                    for(let i in this.sensorTypes) {
                        for( let j in this.sensorTypes[i]) {
                            if(this.sensorTypes[i][j].name.toLowerCase().includes(this.searchTerm.toLowerCase())) {
                                comboss.push([i,j]);
                            }
                        }
                    }
                    //console.log(comboss);
                    //let sensorTypes = this.sensorTypes.filter( s => s);
                    //returnfilteredSensors = filteredSensors.filter(s => s.name.toLowerCase().includes(this.searchTerm.toLowerCase() || comboss.includes([s.type, s.variant])));
                    filteredSensors = filteredSensors.filter(function(s){
                        let typeNames = comboss.filter( c => c[0] == s.type && c[1] == s.variant);
                        return s.name.toLowerCase().includes(searchTerm.toLowerCase()) || typeNames.length;
                    });
                }

                let od = this.orderDirection;

                // Table sorting
                if (this.orderByValue == 'name')
                {
                    return filteredSensors.sort(function (a, b)
                    {

                        if (a.name == b.name)
                        {
                            return 0;
                        }
                        else if (!a.name) 
                        {
                            return 1;
                        }
                        else if (!b.name)
                        {
                            return -1;
                        }
                        else
                        {
                            return (od === 'asc') ? a.name.localeCompare(b.name, undefined, { numeric: true }) : b.name.localeCompare(a.name, undefined, { numeric: true });

                        }
                    });
                }
                else
                {
                    let metricId = Number(this.orderByValue);

                    return filteredSensors.sort(
                        function (a, b)
                        {

                            if (!a.metrics[metricId] && !b.metrics[metricId])
                            {
                                return 0;
                            }
                            else if (!a.metrics[metricId]) 
                            {
                                return 1;
                            }
                            else if (!b.metrics[metricId])
                            {
                                return -1;
                            } else
                            {
                                return (od === 'asc') ? a.metrics[metricId].v - b.metrics[metricId].v : b.metrics[metricId].v - a.metrics[metricId].v;

                            }
                        }
                    );
                }

            }
        },
        methods: {
            changeOrderBy: function (value)
            {
                if (this.orderByValue == value)
                {
                    this.orderDirection = (this.orderDirection == 'asc') ? 'desc' : 'asc';
                } else
                {
                    this.orderByValue = value;
                }
            },
            activeMetricUnit: function (units)
            {
                let activeUnit = _.filter(units, u => u.selected == true);
                return activeUnit[0].name || '-';
            },
            showCollumn: function (id)
            {
                return !this.hiddenMetricColumns.includes(Number(id));
            },
            filterColumns: function (id)
            {
                if (this.hiddenMetricColumns.includes(Number(id)))
                {
                    let index = this.hiddenMetricColumns.indexOf(Number(id));
                    this.hiddenMetricColumns.splice(index, 1);
                } else
                {
                    this.hiddenMetricColumns.push(Number(id));
                }
            },
            sensorName(name)
            {
                return name || '-';
            },
            sensorVariantName(sensor)
            {
                if (!this.sensorTypes[sensor.type])
                {
                    return '-';
                }
                let type = this.sensorTypes[sensor.type];
                if (!type[sensor.variant])
                {
                    return '-';
                }
                return type[sensor.variant].name;
            },
            orderIcon(test)
            {
                if (test == this.orderByValue)
                {
                    return (this.orderDirection == 'asc') ? "⬆️" : "⬇️";
                }
            }
        }
    });
}
