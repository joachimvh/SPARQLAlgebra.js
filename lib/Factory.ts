
import * as A from './algebra';
import * as RDF from "rdf-js";
import {Util as N3Util} from "n3";
import * as _ from "lodash";

const defaultGraph: RDF.DefaultGraph = <RDF.DefaultGraph>{ termType: 'DefaultGraph', value: ''};

export default class Factory
{
    dataFactory: RDF.DataFactory;
    stringType: RDF.NamedNode;

    constructor(dataFactory: RDF.DataFactory) {
        this.dataFactory = dataFactory;
        this.stringType = <RDF.NamedNode>this.createTerm('http://www.w3.org/2001/XMLSchema#string');
    }

    createAlt (left: A.Operation, right: A.Operation): A.Alt { return { type: 'alt', left, right }; }
    createBoundAggregate (variable: RDF.Variable, aggregate: string, expression: A.Expression, distinct: boolean, separator?: string): A.BoundAggregate
    {
        let result = <A.BoundAggregate>this.createAggregateExpression(aggregate, expression, distinct, separator);
        result.variable = variable;
        return result;
    }
    createBgp (patterns: A.Pattern[]): A.Bgp { return { type: 'bgp', patterns }; }
    createConstruct (input: A.Operation, template: A.Pattern[]): A.Construct { return { type: 'construct', input, template }; }
    createDistinct (input: A.Operation) : A.Distinct { return { type: 'distinct', input }; }
    createExtend (input: A.Operation, variable: RDF.Variable, expression: A.Expression) : A.Extend { return { type: 'extend', input, variable, expression }; }
    createFilter (input: A.Operation, expression: A.Expression) : A.Filter { return { type: 'filter', input, expression }; }
    createGraph (input: A.Operation, name: RDF.Term) : A.Graph { return { type: 'graph', input, name }; }
    createGroup (input: A.Operation, variables: RDF.Variable[], aggregates: A.BoundAggregate[]) : A.Group { return { type: 'group', input, variables, aggregates }; }
    createInv (path: A.Operation): A.Inv { return { type: 'inv', path }; }
    createJoin (left: A.Operation, right: A.Operation): A.Join { return { type: 'join', left, right }; }
    createLeftJoin (left: A.Operation, right: A.Operation, expression?: A.Expression): A.LeftJoin
    {
        if (expression)
            return { type: 'leftjoin', left, right, expression };
        return { type: 'leftjoin', left, right };
    }
    createLink (iri: RDF.NamedNode): A.Link { return { type: 'link', iri }; }
    createMinus (left: A.Operation, right: A.Operation): A.Minus { return { type: 'minus', left, right }; }
    createNps (iris: RDF.NamedNode[]): A.Nps { return { type: 'nps', iris }; }
    createOneOrMorePath (path: A.Operation): A.OneOrMorePath { return { type: 'OneOrMorePath', path }; }
    createOrderBy (input: A.Operation, expressions: A.Expression[]) : A.OrderBy { return { type: 'orderby', input, expressions }; }
    createPath (subject: RDF.Term, predicate: A.Operation, object: RDF.Term, graph?: RDF.Term) : A.Path
    {
        if (graph)
            return { type: 'path', subject, predicate, object, graph };
        return { type: 'path', subject, predicate, object, graph: defaultGraph };
    }
    // TODO: cast needed due to missing equals method (could use https://github.com/rdf-ext/rdf-data-model )
    createPattern (subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph?: RDF.Term): A.Pattern
    {
        let pattern: A.Pattern;
        if (graph)
            pattern = <A.Pattern>this.dataFactory.quad(subject, predicate, object, graph);
        else
            pattern = <A.Pattern>this.dataFactory.triple(subject, predicate, object);
        pattern.type = 'pattern';
        return pattern;
    }
    createProject (input: A.Operation, variables: RDF.Variable[]) : A.Project { return { type: 'project', input, variables }; }
    createReduced (input: A.Operation) : A.Reduced { return { type: 'reduced', input }; }
    createSeq (left: A.Operation, right: A.Operation): A.Seq { return { type: 'seq', left, right }; }
    createSlice (input: A.Operation, start: number, length?: number) : A.Slice
    {
        if (length !== undefined)
            return { type: 'slice', input, start, length };
        return { type: 'slice', input, start };
    }
    createUnion (left: A.Operation, right: A.Operation): A.Union { return { type: 'union', left, right }; }
    createValues (variables: RDF.Variable[], bindings: {[key: string]: RDF.Term}[]): A.Values { return { type: 'values', variables, bindings }; }
    createZeroOrMorePath (path: A.Operation): A.ZeroOrMorePath { return { type: 'ZeroOrMorePath', path }; }
    createZeroOrOnePath (path: A.Operation): A.ZeroOrOnePath { return { type: 'ZeroOrOnePath', path }; }

    createAggregateExpression (aggregator: string, expression: A.Expression, distinct: boolean, separator?: string): A.AggregateExpression
    {
        if (separator)
            return { type: 'expression', expressionType: 'aggregate', aggregator, expression, separator, distinct};
        return { type: 'expression', expressionType: 'aggregate', aggregator, expression, distinct };
    }
    createExistenceExpression (not: boolean, input: A.Operation): A.ExistenceExpression { return { type: 'expression', expressionType: 'existence', not, input }; }
    createNamedExpression (name: RDF.NamedNode, args: A.Expression[]): A.NamedExpression { return { type: 'expression', expressionType: 'named', name, args }; }
    createOperatorExpression (operator: string, args: A.Expression[]): A.OperatorExpression { return { type: 'expression', expressionType: 'operator', operator, args }; }
    createTermExpression (term: RDF.Term): A.TermExpression { return { type: 'expression', expressionType: 'term', term }; }

    createTerm (str: string): RDF.Term
    {
        if (str[0] === '?')
            return this.dataFactory.variable(str.substring(1));
        if (_.startsWith(str, '_:'))
            return this.dataFactory.blankNode(str.substring(2));
        if (N3Util.isLiteral(str))
        {
            let value = N3Util.getLiteralValue(str);

            let lang = N3Util.getLiteralLanguage(str);
            if (lang && lang.length > 0)
                return this.dataFactory.literal(value, lang);

            let type = N3Util.getLiteralType(str);
            let datatype = this.stringType;
            if (type && type.length > 0)
                datatype = <RDF.NamedNode>this.createTerm(type);
            return this.dataFactory.literal(value, datatype);
        }
        return <RDF.NamedNode> { termType: 'NamedNode', value: str };
    }
}