import BaseLayout from '../layouts/BaseLayout';
import Loading from '../components/Loading';
import React, { useState, useEffect } from 'react';

const SchemaPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [schemaResult, setSchemaResult] = useState<any[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/.netlify/functions/schema-test')
      .then((res) => res.json())
      .then((records: any) => {
        setLoading(false);
        console.log('records', records);
        if (records.error) {
          return setErrorMessage(records.error);
        }
        setSchemaResult(records);
      })
      .catch((error) => {
        console.log('ERROR', error);
        setErrorMessage(error);
        setLoading(false);
      });
  }, []);

  const cellStyle = {
    verticalAlign: 'top',
    borderTop: '1px solid #ccc',
    borderRight: '1px solid #ccc',
    padding: 10,
  };

  return (
    <BaseLayout padding={20} maxWidth="unset">
      <div>
        <h1>Schema Test</h1>
        {loading && <Loading />}
        {errorMessage && (
          <div style={{ color: 'red' }}>Could not compare schemas. Error: {JSON.stringify(errorMessage)}</div>
        )}

        {schemaResult !== null && (
          <table className="table">
            <tbody>
              <tr>
                <th>Table</th>
                <th>Status</th>
                <th>Missing in target</th>
                <th>Present in target but not master</th>
                <th></th>
              </tr>
              {schemaResult.map((table, index) => (
                <tr key={index}>
                  <td style={cellStyle}>
                    <strong>{table.tableName}</strong>
                  </td>
                  <td style={cellStyle}>
                    {table.status === 'MATCHING' && (
                      <span style={{ backgroundColor: 'green', color: 'white', padding: 3 }}>Matching</span>
                    )}
                    {table.status === 'DIFFERENT' && (
                      <span style={{ backgroundColor: 'red', color: 'white', padding: 3 }}>Different</span>
                    )}
                    {table.error && <span style={{ color: 'red' }}>Error</span>}
                  </td>
                  <td style={cellStyle}>
                    {table['Items in missing in target base'] && (
                      <ul style={{ margin: 0 }}>
                        {table['Items in missing in target base'].map((row: string, index: number) => (
                          <li key={index}>{row}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td style={cellStyle}>
                    {table['Items in target base not in master'] && (
                      <ul style={{ margin: 0 }}>
                        {table['Items in target base not in master'].map((row: string, index: number) => (
                          <li key={index}>{row}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td>{table.error && <span style={{ color: 'red' }}>{table.error}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </BaseLayout>
  );
};

export default SchemaPage;
